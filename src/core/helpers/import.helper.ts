import type { IDBPlanet } from '@/dexie.config'
import PlanetData from '../models/planet-data.model'
import pako from 'pako'
import { nanoid } from 'nanoid'

export function readFileData(buf: ArrayBuffer): IDBPlanet | undefined {
  const rawData = JSON.parse(pako.inflate(buf, { to: 'string' }))
  if (rawData.version || rawData.data) {
    return readFileV2(rawData)
  } else {
    return readFileV1(rawData) // Only v1 files have no version attached
  }
}

function readFileV2(rawData: IDBPlanet): IDBPlanet | undefined {
  try {
    const newIdb: IDBPlanet = {
      id: rawData.id,
      data: PlanetData.createFrom(rawData.data),
      preview: rawData.preview,
    }
    console.debug('[import] Read file data as version 2')
    return newIdb
  } catch (err) {
    console.error(err)
    return undefined
  }
}

function readFileV1(rawData: PlanetData): IDBPlanet | undefined {
  try {
    const newIdb: IDBPlanet = {
      id: nanoid(),
      data: PlanetData.createFrom(rawData),
    }
    console.debug('[import] Read file data as version 1')
    return newIdb
  } catch (err) {
    console.error(err)
    return undefined
  }
}
