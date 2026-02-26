#!/usr/bin/env python3
import subprocess
import os

# SSH and database configuration
ssh_user = "sif-vm1"
ssh_host = "10.2.0.6"
ssh_password = "REDACTED_SSH_PASSWORD"
db_host = "10.2.0.5"
db_user = "u486700931_root"
db_password = "REDACTED_PASSWORD"
db_name = "u486700931_icp"

# Command to run on remote server
remote_command = f"""mysql -h {db_host} -u {db_user} -p'{db_password}' -e "SELECT email, SUBSTRING(password,1,30) as pwd_preview, status, is_verified FROM {db_name}.member WHERE email IN ('somnuk@mju.ac.th', 'somnuk.sin1@gmail.com', 'somnuk.sin@gmail.com');"
"""

# Construct SSH command with options to disable TTY and enable stdin
ssh_cmd = f'ssh -o StrictHostKeyChecking=no -o BatchMode=yes -T -n {ssh_user}@{ssh_host} "{remote_command.strip()}"'

print(f"Executing: {ssh_cmd}")
print("=" * 80)

try:
    # Use Popen to pipe password via stdin
    process = subprocess.Popen(
        ssh_cmd,
        shell=True,
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )
    
    # Send password if prompted (15 second timeout)
    stdout, stderr = process.communicate(input=f"{ssh_password}\n", timeout=15)
    
    print("STDOUT:")
    print(stdout)
    
    if stderr:
        print("STDERR:")
        print(stderr)
    
    print(f"Return code: {process.returncode}")
    
except subprocess.TimeoutExpired:
    print("ERROR: Command timed out")
    process.kill()
except Exception as e:
    print(f"ERROR: {e}")


