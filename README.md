## Database
#### Creation

```bash

sudo apt update
```
```bash

sudo apt install postgresql postgresql-contrib
```
```bash

sudo systemctl enable postgresql
```
```bash

sudo systemctl start postgresql
```

### Create user

```bash

sudo -u postgres psql
```
```bash

CREATE USER user WITH PASSWORD '';
```
```bash

ALTER USER user WITH SUPERUSER;
```
```bash

CREATE DATABASE db OWNER user;
```


### DB Config
Allow connections from different IPs
```bash

nano /etc/postgresql/14/main/pg_hba.conf
```
listen_addresses = '*'          # what IP address(es) to listen on;
```bash

nano /etc/postgresql/14/main/postgresql.conf
```

### Postgres removal

```bash

sudo apt purge postgresql* -y
sudo apt autoremove --purge -y
sudo rm -rf /etc/postgresql /var/lib/postgresql /var/log/postgresql
sudo rm -rf /var/run/postgresql
```

# Node setup

```bash

ssh root@IP
```

```bash

sudo apt update && sudo apt upgrade -y

sudo apt install unattended-upgrades
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

```bash

sudo systemctl stop ssh.socket
sudo systemctl disable ssh.socket
sudo systemctl enable ssh.service
sudo systemctl restart ssh.service
```

Install node

```bash

curl -Ls https://github.com/DigneZzZ/remnawave-scripts/raw/main/remnanode.sh | sudo bash -s -- @ install

```

```bash

sudo apt install ufw

sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 1702 
sudo ufw allow 443/tcp 
```

# SSH keys

LOCAL
```bash

ssh-keygen -t ed25519 -C “ramazan.ittiev@gmail.com”
```

VPS
```bash

sudo nano /etc/ssh/sshd_config
# Port 1702
# PasswordAuthentication no

sudo systemctl restart ssh
```

LOCAL
```bash

ssh-copy-id -i ~/.ssh/KEY.pub -p 1702 root@IP
```
```bash

nano ~/.ssh/config

Host HOST
  HostName IP
  Port 1702
  User root
  IdentityFile ~/.ssh/HOST
```

VPS
```bash

sudo ufw deny 22
sudo ufw reload
```