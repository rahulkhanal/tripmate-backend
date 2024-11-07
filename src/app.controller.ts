import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller()
export class AppController {
  @Get()
  getHello(@Res() res: Response) {
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Greeting</title>
    </head>
    <body>
      <h1>Namaste Saira! Love you 😘</h1>
      <p>This is a API for our project. To view the swagger documentation, click the button below.</p>
      <button onclick="window.location.href='http://localhost:3000/api'">View API Documentation</button>
    </body>
    </html>
  `;
    res.setHeader('Content-Type', 'text/html');
    res.send(htmlContent);
  }
}
