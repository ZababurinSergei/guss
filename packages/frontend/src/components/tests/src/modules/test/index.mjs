import isEmpty from '../isEmpty/isEmpty.mjs'
import defaultTest from './index.test.mjs'
import { assert } from '../chai/index.mjs'
import { expect } from '../chai/index.mjs'
import { should } from '../chai/index.mjs'

let tests = Symbol.for("tests");

export default ( url = false ) => {
  return new Promise(async (resolve, reject) => {
      try {
        let namespace = defaultTest

          if(url) {
              let request = await fetch(url)
              namespace = await request.text()
          }

          const defaultTests = new Function('assert', 'expect', 'should','isEmpty', namespace);
          defaultTests(assert, expect, should, isEmpty, namespace);

          resolve({
              success: true,
              status: "true",
              message: ''
          })
      } catch (e) {
          console.error(e)
          resolve({
              success: false,
              status: "not ok",
              message: e
          })
      }
  })
}
