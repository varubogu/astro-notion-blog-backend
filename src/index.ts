import { logger } from 'hono/logger'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { csrf } from 'hono/csrf';
import commentsApi from './routes/api/v1/comments';
import securityApi from './routes/api/v1/security';

type Bindings = {
  [key in keyof CloudflareBindings]: CloudflareBindings[key]
}

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.use(logger());

app.use(csrf({
  origin: (origin, c) => new RegExp(`${c.env.MAINSITE_URL}$`).test(origin)
}));

app.use('*', cors({
  origin: (origin, c) => c.env.MAINSITE_URL,
  allowHeaders: ['Content-Type', 'X-CSRF-Token'],
  allowMethods: ['GET', 'POST'],
  credentials: true
}));

app.route('/api/v1/comments', commentsApi)
app.route('/api/v1/security', securityApi)


app.get('/', (c) => {
  return c.text("I don't know how you got there, but could you please stop accessing my site? Is there a vulnerability in Wrangler?")
})

export default app