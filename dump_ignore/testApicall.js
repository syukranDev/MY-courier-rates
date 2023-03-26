const express = require('express')
const app = express()
const axios = require('axios')


app.get('/', (req, res) => {
    // res.send('test')
    axios(
        {
            method: 'post',
            url: 'https://www.jtexpress.my/shipping-rates',
            headers: { 
                'accept': '*/*', 
                'content-type': 'application/x-www-form-urlencoded; charset=UTF-8', 
                'x-requested-with': 'XMLHttpRequest', 
                'Cookie': '_ga=GA1.2.1799226497.1678279692; _gid=GA1.2.277345308.1679729433; XSRF-TOKEN=eyJpdiI6IkVUaDlRdWlNMFVZc2U4bStSaTlzd3c9PSIsInZhbHVlIjoiSm1LREtpWk5aSldOSm16U01TNTdzYlNLei9wUFNpTUdva2gxS1NlT2grYndydC9EQVFmR2Y5K1pVK0dsYVM1YVVQN2lEWTdPemNVT2xPc0E2UFlJNnE3UC9kNzJ6a29weElYbTA3VDRka2tqdEFtKzVVUDRXNy91M2h0YnhGR0QiLCJtYWMiOiJiMzFiYzhiOWNlYjkxMTE1YjM5OTA5ZTQ3OTk3OTMyNmUzODI3MzM1YTQ2ZWNjYjYyMDc5YWVkNWY1MGI5N2RmIn0%3D; jt_express_malaysia_session=eyJpdiI6Im9KV2xQMWp6Y3hmWXhNalk4TjZvb1E9PSIsInZhbHVlIjoidUZRVUFwSTE5ZHhFbXZDb3NZMlpDdk83dEZuMjZQODYrdnBuQ284YWJkb1VOUnF1YmUvVFlqTkZPazl5SEZQMHdLcGJPblNValdPdG9FTmdmODhYZHlmUlN2d1RGYUZZSlh0WXYyNUVNVHhsa2FUTU1RYitjNmMrMkZUNi9wL0wiLCJtYWMiOiJkMzI3Y2Y2NzA5N2YxYmIzZGYxMWVjNzMxNWY2ODQyNGYzNWQyOWVhNDZiNzgwMGY4N2M2NWU5OTA1ODE1MTc3In0%3D; _gat_gtag_UA_127851323_1=1', 
            },
            data : '_token=EHZrSmZMLRWrowhv3hXcK8hyk3hXAY31G3NLfU6U&shipping_rates_type=domestic&sender_postcode=42700&receiver_postcode=42700&destination_country=BWN&shipping_type=EZ&weight=12&length=12&width=12&height=12&item_value='
    })
    .then(res=> {
            return plainText = res.data
        }).then(data => {
            console.log(data)
            res.send(data)
        })


    
})

app.listen(4000, () => {
    console.log('connected to 4000 port')
})