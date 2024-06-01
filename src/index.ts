import { logger } from 'hono/logger'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { csrf } from 'hono/csrf';
import commentsApi from './routes/api/v1/comments';
import securityApi from './routes/api/v1/security';

type Bindings = {
  [key in keyof CloudflareBindings]: CloudflareBindings[key]
}

const app = new Hono<{ Bindings: Bindings }>()

app.use(logger());

app.use(csrf({
  origin: (origin, c) => new RegExp(`https://${c.env.MAINSITE_DOMAIN}$`).test(origin)
}));

app.use('*', cors({
  origin: (origin, c) => `https://${c.env.MAINSITE_DOMAIN}`,
  allowHeaders: ['X-Custom-Header', 'Upgrade-Insecure-Requests'],
  allowMethods: ['GET', 'POST'],
  credentials: true
}));

app.route('/api/v1/comments', commentsApi)
app.route('/api/v1/security', securityApi)


app.get('/', (c) => {
  return c.text("I don't know how you got there, but could you please stop accessing my site? Is there a vulnerability in Wrangler?")
})

export default app