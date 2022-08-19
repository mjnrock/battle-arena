# Enabling HTTPS
This will resolve `https://kiszka.com`

## Step 1
Install `kiszka.crt` as a **Trusted Root Certificate Authority**

## Step 2
Make sure that `.env` has:

	HTTPS=true
	SSL_CRT_FILE=./certs/kiszka.crt
	SSL_KEY_FILE=./certs/kiszka.key