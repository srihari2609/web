const compression = require('compression')
const express = require('express');
const forceSSL = require('express-force-ssl');
const expressStaticGzip = require("express-static-gzip");
const cacheControl = require("express-cache-controller");
const history = require('connect-history-api-fallback');
const path = require('path');
const http = require('http');
const https = require('https');
const fs = require('fs');


const app = express();

/*const privateKey = fs.readFileSync('/etc/letsencrypt/live/taski.in/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/taski.in/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/taski.in/chain.pem', 'utf8');*/

const privateKey = fs.readFileSync('/usr/src/app/ssl/server.key', 'utf8');
const certificate = fs.readFileSync('/usr/src/app/ssl/server.crt', 'utf8');
const ca = fs.readFileSync('/usr/src/app/ssl/bundle.ca-bundle', 'utf8');

const ssl_options = {
	key: privateKey,
	cert: certificate,
	ca: ca
};

app.use((req, res, next) => {
		//console.log(req.secure)
    if (req.secure) {
		//console.log('sent')
		next();
    } else {
        res.redirect('https://' + req.headers.host + req.url);
    }
});

app.use(cacheControl({ maxAge: 31536000 }));
app.use("/", expressStaticGzip(path.join(__dirname, 'public')));

app.get('/sitemap.xml', function (req, res, next) {
    const routes = [{path: '/about',}, {path: '/',}, {path: '/faq',}, {path: '/terms',}, {path: '/disclaimer',}, {path: '/privacy',}, {path: '/drive-earn-with-taski',}, {path: '/media-assets',}, {path: '/newsroom',}, {path: '/contact',}, {path: '/refund',}, {path: '/fare',}];
    const knex = require('knex')({
        client: 'mysql',
        connection: {
            host: 'taski2020.c9m7kkxeyswz.ap-south-1.rds.amazonaws.com',
            user: 'taski',
            password: 'Novo1234',
            database: 'taski',
        }
    });


    const XMLWriter = require('xml-writer');
    const xw = new XMLWriter;
    xw.startDocument()
        .startElement('urlset')
        .writeAttribute('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9')
        .writeAttribute('xmlns:xsi', 'http://www.w3.org/2001/XMLSchema-instance')
        .writeAttribute('xmlns:schemaLocation', 'http://www.sitemaps.org/schemas/sitemap/0.9')

routes.forEach(path=>{
    xw.startElement('url');
    xw.writeElement('loc', 'https://www.taski.in' + path.path);
	xw.writeElement('lastmod','2020-12-05T08:57:45+00:00')
	xw.writeElement('changefreq','daily')
	if(path.path==='/')
	xw.writeElement('priority','0.90')
	else
	xw.writeElement('priority','0.90')
    xw.endElement('url')
})

    knex.select('frontend').from('tas_city')
        .then(data => {

            const cityNames = data.filter(function (x) {
                const frontend = JSON.parse(x.frontend)
                if (frontend.hasOwnProperty('urlSlug')) {
                    return frontend.urlSlug !== ""&& frontend.showCity === true;
                } else
                    return false
            }).map(function (y) {
                xw.startElement('url');
                xw.writeElement('loc', 'https://www.taski.in/india/cities/' + JSON.parse(y.frontend).urlSlug);
				xw.writeElement('lastmod','2020-12-05T08:57:45+00:00')
				xw.writeElement('priority','0.80')
                xw.endElement('url')
                routes.push({
                        loc: 'https://www.taski.in/india/cities/' + JSON.parse(y.frontend).urlSlug
                    }
                )
                return 'https://www.taski.in/india/cities/' + JSON.parse(y.frontend).urlSlug;
            });
            res.set('Content-Type', 'text/xml')
            res.send(xw.toString())
        })


});


app.use(history());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res, next) {
	res.set('Cache-Control', 'public, max-age=31557600');
    res.render('index');
});

app.get('/.well-known/acme-challenge/ENT8XxDhY86xP7ME61fy-w_SzEtTN_CZJoB8zkmLO4o', function (req, res, next) {
	res.send("ENT8XxDhY86xP7ME61fy-w_SzEtTN_CZJoB8zkmLO4o.NsmKECnzddDdAJehiHFQp_xLlgDrY1xAMMGKBe-zo2s");
});

const httpServer = http.createServer(app);
const httpsServer = https.createServer(ssl_options, app);
app.use(forceSSL);

httpServer.listen(80, '::');
httpsServer.listen(443, '::');