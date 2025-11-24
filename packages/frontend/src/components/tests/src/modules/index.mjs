import mocha from '../modules/mocha/mocha-es2018.js'
import * as chai from '../../../node_modules/@bundled-es-modules/chai/index.js';

export const Mocha = mocha

export const expect = chai.expect

export const should = chai.should

export const assert = chai.assert

export default {
    expect: chai.expect,
    should: chai.should,
    assert: chai.assert,
    Mocha
}