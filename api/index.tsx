import { Button, Frog } from 'frog'
import { devtools } from 'frog/dev'
import { serveStatic } from 'frog/serve-static'
// import { neynar } from 'frog/hubs'
import { handle } from 'frog/vercel'
import { Aetolia1Service } from './generate.js'

// Uncomment to use Edge Runtime.
// export const config = {
//   runtime: 'edge',
// }

export const app = new Frog({
  assetsPath: '/',
  basePath: '/api',
  // Supply a Hub to enable frame verification.
  // hub: neynar({ apiKey: 'NEYNAR_FROG_FM' })
})

app.frame('/', async (c) => {
  const { buttonValue } = c
  console.log('🚀 ~ buttonValue:', buttonValue)
  // let url = process.env.GIF_SERVER_URL!;
  // let imgUrl = process.env.GIF_IMG_URL!;
  // if (buttonValue) {
  //   url += `?direction=${encodeURIComponent(buttonValue)}`;
  // }
  // const response = await fetch(url);
  // const data = await response.text();
  // console.log('🚀 ~ data:', data);
  const timestamp = new Date().getTime()
  const url = `/api/generate/${timestamp}/${buttonValue ?? ''}`
  return c.res({
    imageAspectRatio: '1:1',
    image: url,
    intents: [
      <Button action='/' value='up'>
        Up
      </Button>,
      <Button action='/' value='down'>
        Down
      </Button>,
      <Button action='/' value='left'>
        Left
      </Button>,
      <Button action='/' value='right'>
        Right
      </Button>,
    ],
  })
})

app.get('/generate/*', async (c) => {
  const service = new Aetolia1Service()
  const fd = c.req.url.split('/')
  const direction = fd[fd.length - 1]

  const buffer = await service.generateGif(direction)
  c.header('Content-Type', 'image/gif')
  return c.body(buffer)
})

// @ts-ignore
const isEdgeFunction = typeof EdgeFunction !== 'undefined'
const isProduction = isEdgeFunction || import.meta.env?.MODE !== 'development'
devtools(app, isProduction ? { assetsPath: '/.frog' } : { serveStatic })

export const GET = handle(app)
export const POST = handle(app)
