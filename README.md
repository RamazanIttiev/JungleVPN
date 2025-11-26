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


## Firewall

Allow SSH (so you can still log in)
```bash

sudo ufw allow from <YOUR_IP> to any port 22
```
```bash

sudo ufw delete allow 22
```

Allow HTTP/HTTPS
```bash

sudo ufw allow 80
```
```bash

sudo ufw allow 443
```

Enable firewall

```bash

sudo ufw enable
```

Check status

```bash

sudo ufw status
```

# SSL cert

```bash

certbot certonly --nginx -d domain
```

```bash

certbot renew --dry-run
```

# Node setup

```bash

sudo apt update && sudo apt upgrade -y

sudo apt install unattended-upgrades
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

```bash

sudo nano /etc/ssh/sshd_config
# Port 1702
# PermitRootLogin no
# PasswordAuthentication no

sudo systemctl restart ssh
```

```bash

adduser jungle
usermod -aG sudo jungle
su - jungle

sudo systemctl stop ssh.socket
sudo systemctl disable ssh.socket
sudo systemctl enable ssh.service
sudo systemctl restart ssh.service
```

```bash

sudo apt install ufw

sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 1702 
sudo ufw allow 443/tcp 
sudo ufw allow NODE_PORT
sudo ufw enable
```

Install remnanode https://docs.rw/docs/install/remnawave-node

Add log volume and rotate https://docs.rw/docs/install/remnawave-node#node-logs

### SSH keys

Generate a key
```bash

ssh-keygen -t ed25519 -C “ramazan.ittiev@gmail.com”
```

Copy to VPS
```bash

ssh-copy-id -i ~/.ssh/KEY.pub -p 1702 jungle@IP
```

Edit ssh config on LOCAL machine
```bash

nano ~/.ssh/config

Host HOST
  HostName IP
  Port 1702
  User jungle
  IdentityFile ~/.ssh/HOST
  
```

On VPS
```bash

sudo ufw deny 22
sudo ufw reload
```