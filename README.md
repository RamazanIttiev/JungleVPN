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


# SSH keys

Generate a key
```bash

ssh-keygen -t ed25519 -C "username"
```

Copy to VPS
```bash

ssh-copy-id -i ~/.ssh/KEY.pub root@ip
```

Edit ssh config
```bash

sudo nano /etc/ssh/sshd_config
```
```
PasswordAuthentication no
PermitRootLogin no
PubkeyAuthentication no
```
```bash

chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
chown -R root:root ~/.ssh
```
```bash

sudo systemctl restart ssh
```


# SSL cert

```bash

certbot certonly --nginx -d domain
```

```bash

certbot renew --dry-run
```


```nginx
# ------------------------------
# HTTP (port 80) redirect for BOTH domains
# ------------------------------
server {
    listen 80;
    server_name thejungle.pro;
    return 301 https://$host$request_uri;
}

# ------------------------------
# HTTPS: thejungle.pro (3x-ui)
# ------------------------------
server {
    listen 443 ssl;
    server_name thejungle.pro;

    ssl_certificate /etc/letsencrypt/live/thejungle.pro/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/thejungle.pro/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;

    location /sub/ {
        proxy_pass http://remnawave;
        proxy_ssl_verify off;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

    }

    location /redirect {
        if ($arg_link) {
            return 302 $arg_link;
        }
        return 400 "Missing 'link' parameter";
    }
}
```