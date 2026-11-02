#!/usr/bin/env python3
"""Create reproducible source-only companion ZIPs; never package NPSSO tokens."""
from __future__ import annotations
import argparse
import hashlib
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PACKAGES = {
  "ylta-psn-sync-kit.zip": {
    "package.json": "tools/windows-exporter/package.json",
    "README.txt": "tools/windows-exporter/README.txt",
    "START-EXPORT.cmd": "tools/windows-exporter/START-EXPORT.cmd",
    "export.mjs": "tools/windows-exporter/export.mjs",
  },
  "ylta-psnprofiles-browser-helper.zip": {
    "README.md": "tools/psnprofiles-helper/README.md",
    "manifest.json": "tools/psnprofiles-helper/manifest.json",
    "popup.html": "tools/psnprofiles-helper/popup.html",
    "popup.css": "tools/psnprofiles-helper/popup.css",
    "popup.js": "tools/psnprofiles-helper/popup.js",
    "icon.png": "tools/psnprofiles-helper/icon.png",
  },
}

def build(source: Path, dst: Path, members: dict[str, str], license_file: Path) -> None:
    dst.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(dst, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for name, rel in sorted({**members, "LICENSE": None}.items()):
            content = (source / rel if rel is not None else license_file).read_bytes()
            info = zipfile.ZipInfo(name, date_time=(2026, 1, 1, 0, 0, 0))
            info.create_system = 3
            info.external_attr = 0o100644 << 16
            info.compress_type = zipfile.ZIP_DEFLATED
            archive.writestr(info, content, compress_type=zipfile.ZIP_DEFLATED, compresslevel=9)

def verify(source: Path, dst: Path, members: dict[str, str], license_file: Path) -> None:
    sources = {**members, "LICENSE": None}
    with zipfile.ZipFile(dst) as archive:
        assert archive.testzip() is None, f"Invalid ZIP: {dst}"
        assert sorted(archive.namelist()) == sorted(sources), f"Missing ZIP members: {dst}"
        for name, rel in sources.items():
            expected = (source / rel if rel is not None else license_file).read_bytes()
            assert archive.read(name) == expected, f"Source mismatch: {dst}:{name}"

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--source-root", type=Path, default=ROOT)
    parser.add_argument("--output-dir", type=Path, default=ROOT / "dist")
    parser.add_argument("--license-file", type=Path, default=ROOT / "LICENSE")
    parser.add_argument("--verify-only", action="store_true")
    options = parser.parse_args()
    for name, members in PACKAGES.items():
        dst = options.output_dir.resolve() / name
        if not options.verify_only:
            build(options.source_root.resolve(), dst, members, options.license_file.resolve())
        verify(options.source_root.resolve(), dst, members, options.license_file.resolve())
        digest = hashlib.sha256(dst.read_bytes()).hexdigest()
        print(f"{name}: {dst.stat().st_size} bytes, SHA256 {digest}")
    print("All release ZIPs match the source files.")

if __name__ == "__main__":
    main()
