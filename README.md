# webpush-solganeo
This project seeks to create a server to send webpush-notifications using SFMC and the journey builder tool.

## Before start

SFMC needs an endpoint to send the information between sfmc and the custom application. To do that you can use ngrok to open a local port and offer a public endpoint.

1. Install ngrok: https://ngrok.com/ 
2. Run ngrok: `ngrok http 3000` 🚀
3. Change ./public/config.json and replace all the endpoint values with the ones from ngrok.
4. Run the server using: `npm run dev` (If needes execute before `npm install`)
5. Go to the SFMC package and change the endpoint to the one from ngrok.
6. Open a journey builder and create a new journey. 😁

## Create ./api/config/.env.local.json

You can find all those variables inside your installed package on sfmc. 👍

```json
{
  "env": "development",
  "sfmc_client_id": "client_id",
  "sfmc_client_secret": "client_secret",
  "sfmc_auth_url": "https://mcjnmn9mfnxq4m36wvmtt59plqg1.auth.marketingcloudapis.com/v2/token",
  "jwt_secret": "jwt_token",
  "queue": "test"
}
```

To have a more detail documentation, please visit the following link 😁 https://doc.clickup.com/20410493/d/kew3x-962/web-push-documentation
