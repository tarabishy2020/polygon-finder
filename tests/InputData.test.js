import { assert, expect, test } from 'vitest'
import {CreateInputDataStore, parseVEJson} from '../InputData'
// Edit an assertion and save to see HMR in action

test('Creates an InputDataStore', () => {
  const store = CreateInputDataStore()
  expect(store).toMatchObject
  ({
    vertices: [],
    edges: [],
    addVertex: expect.any(Function),
    addVertices: expect.any(Function),
    addEdge: expect.any(Function),
    addEdges: expect.any(Function),
    clear: expect.any(Function),
  })
  // add a single vertex
  const vertex = [2,2]
  store.addVertex(vertex)
  expect(store.vertices).toEqual(expect.arrayContaining([vertex]))
  // add multiple vertices
  const vertices = [[3,3],[4,4],[5,5]]
  store.addVertices(vertices)
  expect(store.vertices).toEqual(
    expect.arrayContaining([...vertices,vertex])
  )
  // add a single edge
  const edge = [2,2]
  store.addEdge(edge)
  expect(store.edges).toEqual(expect.arrayContaining([edge]))
  // add multiple vertices
  const edges = [[3,3],[4,4],[5,5]]
  store.addEdges(edges)
  expect(store.edges).toEqual(
    expect.arrayContaining([...edges,edge])
  )
  // clear
  store.clear()
  expect(store.edges.length).toBe(0)
  expect(store.vertices.length).toBe(0)
})
test('parseVEJson parses correct Json to an InputDataStore',()=>{
  const input = {
    vertices:[[0,0],[1,1],[2,2]],
    edges:[[0,1],[1,2],[2,0]],
  }
  const inputString = JSON.stringify(input)
  const store = parseVEJson(inputString)

  expect(store.vertices).toEqual(input.vertices)
  expect(store.edges).toEqual(input.edges)
})
test('parseVEJson fails on incorrect Json to an InputDataStore',()=>{
  const input = {
    points:[[0,0],[1,1],[2,2]],
    lines:[[0,1],[1,2],[2,0]],
  }
  const inputString = JSON.stringify(input)
  const store = parseVEJson(inputString)
  expect(store).toBeUndefined()
})