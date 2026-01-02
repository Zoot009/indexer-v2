import { Queue } from 'bullmq'
import redis from './redis'

export const urlQueue = new Queue('urls-index-check', {
  connection: redis,
})