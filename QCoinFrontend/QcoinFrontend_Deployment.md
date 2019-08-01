## QcoinFrontend

This is instructions for deploying QcoinFrontend

feature:

- HTTP2
- HTTPS
- Brotli

## Prepare the environment

### Using Docker

1. install `nginx-brotli`

   ```
   sudo docker pull fholzer/nginx-brotli
   ```

2. create `docker_nginx.conf`

   ```nginx
   user nobody;
   worker_processes auto;
   pid /run/nginx.pid;
   
   events {
   	worker_connections 768;
   	# multi_accept on;
   }
   
   http {
   
   	##
   	# Basic Settings
   	##
   
   	sendfile on;
   	tcp_nopush on;
   	tcp_nodelay on;
   	keepalive_timeout 65;
   	types_hash_max_size 2048;
   	# server_tokens off;
   
   	# server_names_hash_bucket_size 64;
   	# server_name_in_redirect off;
   
   	include /etc/nginx/mime.types;
   	default_type application/octet-stream;
   
   	##
   	# SSL Settings
   	##
   
   	ssl_protocols TLSv1 TLSv1.1 TLSv1.2; # Dropping SSLv3, ref: POODLE
   	ssl_prefer_server_ciphers on;
   
   	##
   	# Logging Settings
   	##
   
   	access_log /var/log/nginx/access.log;
   	error_log /var/log/nginx/error.log;
   
   	##
   	# Brotli Settings
   	##
   	brotli on; 
   	brotli_static on;
   	brotli_comp_level 6; 
   	brotli_buffers 16 8k; 
   	brotli_min_length 20; 
   	brotli_types *; 
   	##
   	# Gzip Settings
   	##
   	gzip_static on;
   	gzip on;
   	gzip_disable "msie6";
   	gzip_vary on;
   	gzip_proxied any;
   	gzip_comp_level 6;
   	gzip_buffers 16 64k;
   	#gzip_http_version 1.1;
   	gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
   
   	##
   	# Virtual Host Configs
   	##
   
   	include /etc/nginx/conf.d/*.conf;
   	include /etc/nginx/sites-enabled/*;
   }
   ```

3. create `docker_qcoin.conf`

   ```nginx
   server {
       listen       443 ssl http2;
       server_name  127.0.0.1;
       ssl_certificate /usr/share/QcoinFrontend/ssl/qcoin.crt;
       ssl_certificate_key /usr/share/QcoinFrontend/ssl/qcoin.rsa;
       location ^~/modules/ { root   /usr/share/QcoinFrontend/; }
   	
       location / {
           root   /usr/share/QcoinFrontend/dist;
           index  index.html index.htm;
           try_files $uri $uri/ /index.html;
       }
   	
       location ^~/api/ { proxy_pass http://127.0.0.1:5438/api/; }
    }
   
   ```

4. run docker like this

   ```bash
   sudo docker run \
     --net=host \
     -v /home/intel/xytao/QcoinFrontend:/usr/share/QcoinFrontend \
     -v /home/intel/xytao/QcoinFrontend/docker_qcoin.conf:/etc/nginx/sites-enabled/docker_qcoin.conf \
     -v /home/intel/xytao/QcoinFrontend/docker_nginx.conf:/etc/nginx/nginx.conf \
     -v /home/intel/xytao/QcoinFrontend/log:/var/log/nginx \
     -d \
     fholzer/nginx-brotli
   ```

