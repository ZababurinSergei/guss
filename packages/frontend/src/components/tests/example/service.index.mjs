let tests = Symbol.for("tests");
let swagger = Symbol.for("swagger");

/**
 * Chai import in window['@newkind/tests']
 * console.log('assert',window['@newkind/tests'].assert)
 * console.log('events',window['@newkind/tests'].events)
 * console.log('expect',window['@newkind/tests'].expect)
 * console.log('should',window['@newkind/tests'].should)
 * console.log('events',window['@newkind/tests'].isEmpty)
 */

// console.log('assert',window[tests].assert)
// console.log('expect',window[tests].expect)
// console.log('should',window[tests].should)
// console.log('events',window[tests].isEmpty)

describe('Остров 111111111', async function () {
    this.timeout(10000);
    before(async function () { });
    describe('У лукоморья дуб зелёный;', async function () {
        it('Посадить дерево', function () {
            return new Promise(async (resolve, reject) => {
                console.log('---- swagger ----')
                resolve(true)
            })
        })
        it('подожать 20-30 лет', function () {
            return new Promise(async (resolve, reject) => {
                resolve(true)
            })
        })
    })
    describe('Златая цепь на дубе том:', async function () {
        it('Купить прибор для анализа драгоценных металлов', function () {
            return new Promise(async (resolve, reject) => {
                resolve(true)
            })
        })
        it('Снять пробу', function () {
            return new Promise(async (resolve, reject) => {
                resolve(true)
            })
        })
    })
    describe('И днём и ночью кот учёный', async function () {
        it('Взять кота', function () {
            return new Promise(async (resolve, reject) => {
                resolve(true)
            })
        })
        it('Взять учебник математики', function () {
            return new Promise(async (resolve, reject) => {
                resolve(true)
            })
        })
        it('Применить учкбник к коту', function () {
            return new Promise(async (resolve, reject) => {
                resolve(true)
            })
        })
    })
    describe('Всё ходит по цепи кругом;', async function () {
        it('Последить один день', function () {
            return new Promise(async (resolve, reject) => {
                resolve(true)
            })
        })
        it('Последить ещё один день', function () {
            return new Promise(async (resolve, reject) => {
                resolve(true)
            })
        })
        it('Поставить перед котом препятствие', function () {
            return new Promise(async (resolve, reject) => {
                resolve(true)
            })
        })
    })
})