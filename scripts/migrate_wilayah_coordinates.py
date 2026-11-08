#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
migrate_wilayah_coordinates.py
Migrate coordinates (latitude and longitude) into table `wilayah` in db_adatnusa.
Uses Laragon MySQL binary or mysql client.
"""

import os
import sys
import subprocess
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
SQL_FILE = PROJECT_ROOT / "scripts" / "add_coordinates_to_wilayah.sql"

DB_HOST = os.environ.get("DB_HOST", "127.0.0.1")
DB_PORT = os.environ.get("DB_PORT", "3306")
DB_USER = os.environ.get("DB_USER", "root")
DB_PASS = os.environ.get("DB_PASSWORD", "")
DB_NAME = os.environ.get("DB_NAME", "db_adatnusa")

POSSIBLE_MYSQL_PATHS = [
    r"C:\laragon\bin\mysql\mysql-8.0.30-winx64\bin\mysql.exe",
    r"C:\laragon\bin\mysql\mysql-5.7.39-winx64\bin\mysql.exe",
    r"C:\laragon\bin\mysql\mysql-8.4.3-winx64\bin\mysql.exe",
    "mysql",
]

def find_mysql_binary():
    for path in POSSIBLE_MYSQL_PATHS:
        try:
            res = subprocess.run([path, "--version"], capture_output=True, text=True)
            if res.returncode == 0:
                return path
        except FileNotFoundError:
            continue
    return None

def run_migration():
    mysql_bin = find_mysql_binary()
    if not mysql_bin:
        print("[ERROR] MySQL executable not found in Laragon paths or PATH.")
        sys.exit(1)

    print(f"[INFO] Using MySQL client at: {mysql_bin}")
    print(f"[INFO] Reading SQL from: {SQL_FILE}")

    if not SQL_FILE.exists():
        print(f"[ERROR] SQL file not found: {SQL_FILE}")
        sys.exit(1)

    sql_content = SQL_FILE.read_text(encoding="utf-8")

    cmd = [
        mysql_bin,
        "-h", DB_HOST,
        "-P", str(DB_PORT),
        "-u", DB_USER,
    ]
    if DB_PASS:
        cmd.append(f"-p{DB_PASS}")
    cmd.append(DB_NAME)

    print(f"[INFO] Running migration on database `{DB_NAME}`...")
    res = subprocess.run(cmd, input=sql_content, text=True, capture_output=True)

    if res.returncode != 0:
        print(f"[ERROR] Migration failed:\n{res.stderr}")
        sys.exit(res.returncode)

    print(f"[SUCCESS] Migration executed successfully.")
    if res.stdout:
        print(res.stdout)

    # Verify results
    verify_sql = "SELECT id_wilayah, nama_wilayah, latitude, longitude FROM wilayah WHERE parent_id = 17 OR id_wilayah = 17;"
    verify_cmd = [
        mysql_bin,
        "-h", DB_HOST,
        "-P", str(DB_PORT),
        "-u", DB_USER,
    ]
    if DB_PASS:
        verify_cmd.append(f"-p{DB_PASS}")
    verify_cmd.append(DB_NAME)

    verify_res = subprocess.run(verify_cmd, input=verify_sql, text=True, capture_output=True)
    if verify_res.returncode == 0:
        print("\n[VERIFICATION] Updated Wilayah Coordinates in Bali:")
        print(verify_res.stdout)

if __name__ == "__main__":
    run_migration()
