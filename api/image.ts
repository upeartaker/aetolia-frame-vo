import { Aetolia1Service } from "./generate.js"
export const runtime = 'edge';
export async function  GET(req:Request){
  const service = new Aetolia1Service()
  const fd = req.url.split('/')
  const direction = fd[fd.length - 1]

  // const buffer = await service.generateGif(direction)
  req.headers.set('Content-Type', 'image/gif')
  return new Response('123')
}