let api = Symbol.for("api");

describe.skip('Получение списка раздела', async function () {
    this.timeout(10000);
    it('GET k67f /api/v1/directory', function () {
        return new Promise(async (resolve, reject) => {
            const request = {
                "active": true,
                "showActive": true
            }
            const data = await window[api].fetch["get"]('/api/v1/directory',request, true)
            console.log('⬛ get /api/v1/directory', data.res.body)
            data.res.ok ? resolve() : reject(data.res.body)
        })
    })
    it('GET 0ajt67 /api/v1/directory/record', function () {
        return new Promise(async (resolve, reject) => {
            const request = {
                "active": true,
                "directoryId": "0b42c42b-4467-4dee-9085-54ba2aef287b",
                "limit": 6,
                "offset": 0
            }
            const result = await window[api].fetch["get"]('/api/v1/directory/record',request, true)
            console.log('⬛ get /api/v1/directory/record',{
                "body": request,
                'response': result
            })
            result.res.ok ? resolve() : reject()
        })
    })
    it('GET f85k /api/v1/directory/record', function () {
        return new Promise(async (resolve, reject) => {
            const request = {
                "active": true,
                "directoryId": "0b25b22d-9e9f-448f-97c5-76e9d87b57cf",
                "limit": 6,
                "offset": 0
            }
            const result = await window[api].fetch["get"]('/api/v1/directory/record',request, true)
            console.log('⬛ get /api/v1/directory/record',{
                "body": request,
                'response': result
            })
            result.res.ok ? resolve() : reject()
        })
    })
    it('GET f75j3 /api/v1/directory/record', function () {
        return new Promise(async (resolve, reject) => {
            const request = {
                "active": true,
                "directoryId": "9c1c47d9-4210-4f93-baa5-78f2addeb66c",
                "limit": 6,
                "offset": 0
            }
            const result = await window[api].fetch["get"]('/api/v1/directory/record',request, true)
            console.log('⬛ get /api/v1/directory/record',{
                "body": request,
                'response': result
            })
            result.res.ok ? resolve() : reject()
        })
    })
    it('GET hg659s /api/v1/directory/record', function () {
        return new Promise(async (resolve, reject) => {
            const request = {
                "active": true,
                "directoryId": "2dcf8df4-6729-4906-a332-b47625cebbc2",
                "limit": 6,
                "offset": 0
            }
            const result = await window[api].fetch["get"]('/api/v1/directory/record',request, true)
            console.log('⬛ get /api/v1/directory/record',{
                "body": request,
                'response': result
            })
            result.res.ok ? resolve() : reject()
        })
    })
    it('GET 9dju2 /api/v1/directory/record', function () {
        return new Promise(async (resolve, reject) => {
            const request = {
                "active": true,
                "directoryId": "c260c45c-d94a-48b8-848b-240c0c8915d0",
                "limit": 6,
                "offset": 0
            }
            const result = await window[api].fetch["get"]('/api/v1/directory/record',request, true)
            console.log('⬛ get /api/v1/directory/record',{
                "body": request,
                'response': result
            })
            result.res.ok ? resolve() : reject()
        })
    })
    it('GET 8fg3 /api/v1/directory/record', function () {
        return new Promise(async (resolve, reject) => {
            const request = {
                "active": true,
                "directoryId": "46113b17-a08a-45ec-8143-947becb0638d",
                "limit": 6,
                "offset": 0
            }
            const result = await window[api].fetch["get"]('/api/v1/directory/record',request, true)
            console.log('⬛ get /api/v1/directory/record',{
                "body": request,
                'response': result
            })
            result.res.ok ? resolve() : reject()
        })
    })
    it('GET jh6r /api/v1/directory/record', function () {
        return new Promise(async (resolve, reject) => {
            const request = {
                "active": true,
                "directoryId": "c372f935-3471-41f0-8c24-5684c57f5cb2",
                "limit": 6,
                "offset": 0
            }
            const result = await window[api].fetch["get"]('/api/v1/directory/record',request, true)
            console.log('⬛ get /api/v1/directory/record',{
                "body": request,
                'response': result
            })
            result.res.ok ? resolve() : reject()
        })
    })
    it('GET sdfe4 /api/v1/rule', function () {
        return new Promise(async (resolve, reject) => {
            const request = {
                "active": true,
                "limit": 6,
                "offset": 0
            }
            const result = await window[api].fetch["get"]('/api/v1/rule',request, true)
            console.log('⬛ get /api/v1/rule',{
                "body": request,
                'response': result
            })
            result.res.ok ? resolve() : reject()
        })
    })
    it('GET asedf /api/v1/subscription', function () {
        return new Promise(async (resolve, reject) => {
            const request = {
                "active": true,
                "limit": 6,
                "offset": 0
            }
            const result = await window[api].fetch["get"]('/api/v1/subscription',request, true)
            console.log('⬛ get /api/v1/subscription',{
                "body": request,
                'response': result
            })
            result.res.ok ? resolve() : reject()
        })
    })
})


describe.skip('Добавление/Удаление настроек правил', async function () {
    this.timeout(10000);
    let state = {}

    it('GET /api/v1/rule', function () {
        return new Promise(async (resolve, reject) => {
            const request = {
                "active": true,
                "interactionId": "2ac62af5-e1ea-42d0-9493-051bdb540255",
                "limit": 12,
                "offset": 0
            }
            const result = await window[api].fetch["get"]('/api/v1/rule',request, true)
            console.log('⬛ get /api/v1/rule',{
                "body": request,
                'response': result
            })
            result.res.ok ? resolve() : reject()
        })
    })
    it('GET /api/v1/directory/record', function () {
        return new Promise(async (resolve, reject) => {
            const request = {
                "active": true,
                "directoryId": "46113b17-a08a-45ec-8143-947becb0638d",
                "limit": 1000,
                "offset": 0
            }
            const result = await window[api].fetch["get"]('/api/v1/directory/record',request, true)
            console.log('⬛ get /api/v1/directory/record',{
                "body": request,
                'response': result
            })
            result.res.ok ? resolve() : reject()
        })
    })
    it('GET /api/v1/directory/record', function () {
        return new Promise(async (resolve, reject) => {
            const request = {
                "active": true,
                "directoryId": "9c1c47d9-4210-4f93-baa5-78f2addeb66c",
                "limit": 1000,
                "offset": 0
            }
            const result = await window[api].fetch["get"]('/api/v1/directory/record',request, true)
            console.log('⬛ get /api/v1/directory/record',{
                "body": request,
                'response': result
            })
            result.res.ok ? resolve() : reject()
        })
    })
    it('POST /api/v1/rule', function () {
        return new Promise(async (resolve, reject) => {
            const request = {
                "active": true,
                "createdAt": "2023-11-16T15:49:57.303Z",
                "interactionId": "0d8b973c-5dd8-4440-96c6-0e7b6a07c530",
                "headerId": "015101ba-add3-4b21-861d-e8f4746a356f"
            }
            const result = await window[api].fetch["post"]('/api/v1/rule',request, true)
            state.result = result.res
            console.log('⬛ post /api/v1/rule',{
                "body": request,
                'response': result
            })
            result.res.ok ? resolve() : reject()
        })
    })
    it('GET /api/v1/rule', function () {
        return new Promise(async (resolve, reject) => {
            const request = {
                "active": true,
                "interactionId": "2ac62af5-e1ea-42d0-9493-051bdb540255",
                "limit": 20,
                "offset": 0
            }
            const result = await window[api].fetch["get"]('/api/v1/rule',request, true)
            console.log('⬛ get /api/v1/rule',{
                "body": request,
                'response': result
            })
            result.res.ok ? resolve() : reject()
        })
    })
    it('DELETE /api/v1/rule', function () {
        return new Promise(async (resolve, reject) => {
            const request = {
                "ruleId": state.result.body.id
            }
            const result = await window[api].fetch["delete"]('/api/v1/rule',request, true)
            console.log('⬛ delete /api/v1/rule',{
                "body": request,
                'response': result
            })
            result.res.ok ? resolve() : reject()
        })
    })
    it('GET /api/v1/rule', function () {
        return new Promise(async (resolve, reject) => {
            const request = {
                "active": true,
                "interactionId": "2ac62af5-e1ea-42d0-9493-051bdb540255",
                "limit": 20,
                "offset": 0
            }
            const result = await window[api].fetch["get"]('/api/v1/rule',request, true)
            console.log('⬛ get /api/v1/rule',{
                "body": request,
                'response': result
            })
            result.res.ok ? resolve() : reject()
        })
    })
})


describe.skip('Добавление/Удаление подписки', async function () {
    this.timeout(10000);""
    it('GET: /api/v1/directory/record', function () {
        return new Promise(async (resolve, reject) => {
            const request = {
                "active": true,
                "directoryId": "46113b17-a08a-45ec-8143-947becb0638d",
                "limit": 1000,
                "offset": 0
            }
            const result = await window[api].fetch["get"]('/api/v1/directory/record',request, true)
            console.log('⬛ get /api/v1/directory/record',{
                "body": request,
                'response': result
            })
            result.res.ok ? resolve() : reject()
        })
    })
    it('GET: /api/v1/directory/record', function () {
        return new Promise(async (resolve, reject) => {
            const request = {
                "active": true,
                "directoryId": "c372f935-3471-41f0-8c24-5684c57f5cb2",
                "limit": 1000,
                "offset": 0
            }
            const result = await window[api].fetch["get"]('/api/v1/directory/record',request, true)
            console.log('⬛ get /api/v1/directory/record',{
                "body": request,
                'response': result
            })
            result.res.ok ? resolve() : reject()
        })
    })
    it('POST: /api/v1/subscription', function () {
        return new Promise(async (resolve, reject) => {
            const request = {
                "active": true,
                "createdAt": new Date(Date.now()).toISOString(),
                "recipientId": "0ccc32ba-6df0-11ee-b962-0242ac120002",
                "interactionId": "0d8b973c-5dd8-4440-96c6-0e7b6a07c530",
                "startAt": "2023-11-07T22:39:00.000Z",
                "endAt": "2023-11-11T22:39:00.000Z"
            }
            const result = await window[api].fetch["post"]('/api/v1/subscription',request, true)
            console.log('⬛ post /api/v1/subscription',{
                "body": request,
                'response': result
            })
            result.res.ok ? resolve() : reject()
        })
    })
})

describe.skip('Добавление/Удаление настройки подписки', async function () {
    this.timeout(10000);
    let response = {}
    it('9zd8ZIRYHPmQ GET: /api/v1/rule', function () {
        return new Promise(async (resolve, reject) => {
            const request = {
                "active": true,
                "interactionId": "614e6d1e-6dcb-11ee-b962-0242ac120002",
                "limit": 320,
                "offset": 0
            }
            const result = await window[api].fetch["get"]('/api/v1/rule',request, true)
            console.log('⬛ get /api/v1/rule',{
                "body": request,
                'response': result
            })
            result.res.ok ? resolve() : reject()
        })
    })

    it('duS9r=X=9Vee GET: /api/v1/directory/record', function () {
        return new Promise(async (resolve, reject) => {
            const request = {
                "active": true,
                "directoryId": "0b25b22d-9e9f-448f-97c5-76e9d87b57cf",
                "limit": 320,
                "offset": 0
            }
            const result = await window[api].fetch["get"]('/api/v1/directory/record',request, true)
            console.log('⬛ get /api/v1/directory/record',{
                "body": request,
                'response': result
            })
            result.res.ok ? resolve() : reject()
        })
    })

    it('HVURh3Pe3P4I POST: /api/v1/subscription/setting', function () {
        return new Promise(async (resolve, reject) => {
            const request = [
                {
                    "active": true,
                    "createdAt": "2023-11-20T23:16:18.043Z",
                    "subscriptionId": "0dd84fc4-6dcb-11ee-b962-0242ac120002",
                    "headerId": "78a13a89-8e5b-4e4c-bea2-10dbffcbc615",
                    "value": "85"
                }
            ]
            const result = await window[api].fetch["post"]('/api/v1/subscription/setting',request, true)
            console.log('⬛ post /api/v1/subscription/setting',{
                "body": request,
                'response': result
            })
            result.res.ok ? resolve() : reject()
        })
    })

    it('Tk$-FClpXZWj DELETE: /api/v1/subscription/setting', function () {
        return new Promise(async (resolve, reject) => {
            const request = {
                "settingId": "ce2a19b6-563e-4d99-a3f4-d4597ce978ff"
            }
            const result = await window[api].fetch["delete"]('/api/v1/subscription/setting',request, true)
            console.log('⬛ delete /api/v1/subscription/setting',{
                "body": request,
                'response': result
            })
            result.res.ok ? resolve() : reject()
        })
    })
})


describe.skip('Добавление/Удаление справочника', async function () {
    this.timeout(10000);
    let state = {}
    it('POST: /api/v1/directory/record', function () {
        return new Promise(async (resolve, reject) => {
            const request = {
                "active": true,
                "createdAt": new Date(Date.now()).toISOString(),
                "directoryId": "0b42c42b-4467-4dee-9085-54ba2aef287b",
                "code": "test",
                "name": "test"
            }

            const result = await window[api].fetch["post"]('/api/v1/directory/record',request, true)
            state.result = result

            console.log('⬛ post /api/v1/directory/record',{
                "body": request,
                'response': result
            })
            result.res.ok ? resolve() : reject()
        })
    })
    it('DELETE: /api/v1/directory/record', function () {
        return new Promise(async (resolve, reject) => {
            let request = {
                "recordId": state?.result?.res?.body?.id,
                "directoryId": "0b42c42b-4467-4dee-9085-54ba2aef287b"
            }
            if(state?.result?.res?.body?.id) {
                const result = await window[api].fetch["delete"]('/api/v1/directory/record',request, true)
                console.log('⬛ delete /api/v1/directory/record',{
                    "body": request,
                    'response': result
                })
                result.res.ok ? resolve() : reject()
            } else {
                reject('Запись не была создана')
            }
        })
    })
})

describe.skip('Фильтрация справочников', async function () {
    this.timeout(10000);
    it('POST: /api/v1/directory/record/filter', function () {
        return new Promise(async (resolve, reject) => {
            const request = {
                "active": true,
                "directoryId": "0b42c42b-4467-4dee-9085-54ba2aef287b",
                "type": 0,
                "operator": "like",
                "field": "name",
                "value": "Ба",
                "limit": 30,
                "offset": 0
            }
            const result = await window[api].fetch["post"]('/api/v1/directory/record/filter',request, true)
            console.log('⬛ post /api/v1/directory/record/filter',{
                "body": request,
                'response': result
            })
            result.res.ok ? resolve() : reject()
        })
    })
    it('POST: /api/v1/directory/record/filter', function () {
        return new Promise(async (resolve, reject) => {
            const request = {
                "active": true,
                "directoryId": "0b42c42b-4467-4dee-9085-54ba2aef287b",
                "type": 0,
                "operator": "like",
                "field": "name",
                "value": "Б",
                "limit": 30,
                "offset": 0
            }
            const result = await window[api].fetch["post"]('/api/v1/directory/record/filter',request, true)
            console.log('⬛ post /api/v1/directory/record/filter',{
                "body": request,
                'response': result
            })
            result.res.ok ? resolve() : reject()
        })
    })
    it('POST: /api/v1/directory/record/filter', function () {
        return new Promise(async (resolve, reject) => {
            const request = {
                "active": true,
                "directoryId": "0b42c42b-4467-4dee-9085-54ba2aef287b",
                "type": 0,
                "operator": "like",
                "field": "code",
                "value": "1",
                "limit": 30,
                "offset": 0
            }
            const result = await window[api].fetch["post"]('/api/v1/directory/record/filter',request, true)
            console.log('⬛ post /api/v1/directory/record/filter',{
                "body": request,
                'response': result
            })
            result.res.ok ? resolve() : reject()
        })
    })
    it('POST: /api/v1/directory/record/filter', function () {
        return new Promise(async (resolve, reject) => {
            const request = {
                "active": true,
                "directoryId": "0b42c42b-4467-4dee-9085-54ba2aef287b",
                "type": 0,
                "operator": "like",
                "field": "code",
                "value": "1ю",
                "limit": 30,
                "offset": 0
            }
            const result = await window[api].fetch["post"]('/api/v1/directory/record/filter',request, true)
            console.log('⬛ post /api/v1/directory/record/filter',{
                "body": request,
                'response': result
            })
            result.res.ok ? resolve() : reject()
        })
    })
    it('POST: /api/v1/directory/record/filter', function () {
        return new Promise(async (resolve, reject) => {
            const request = {
                "active": true,
                "directoryId": "0b42c42b-4467-4dee-9085-54ba2aef287b",
                "type": 0,
                "operator": "like",
                "field": "code",
                "value": "1",
                "limit": 30,
                "offset": 0
            }
            const result = await window[api].fetch["post"]('/api/v1/directory/record/filter',request, true)
            console.log('⬛ post /api/v1/directory/record/filter',{
                "body": request,
                'response': result
            })
            result.res.ok ? resolve() : reject()
        })
    })
    it('POST: /api/v1/directory/record/filter', function () {
        return new Promise(async (resolve, reject) => {
            const request = {
                "active": true,
                "directoryId": "0b42c42b-4467-4dee-9085-54ba2aef287b",
                "type": 0,
                "operator": "like",
                "field": "code",
                "value": "1.",
                "limit": 30,
                "offset": 0
            }
            const result = await window[api].fetch["post"]('/api/v1/directory/record/filter',request, true)
            console.log('⬛ post /api/v1/directory/record/filter',{
                "body": request,
                'response': result
            })
            result.res.ok ? resolve() : reject()
        })
    })
    it('POST: /api/v1/directory/record/filter', function () {
        return new Promise(async (resolve, reject) => {
            const request = {
                "active": true,
                "directoryId": "0b42c42b-4467-4dee-9085-54ba2aef287b",
                "type": 0,
                "operator": "like",
                "field": "code",
                "value": "1.2",
                "limit": 30,
                "offset": 0
            }
            const result = await window[api].fetch["post"]('/api/v1/directory/record/filter',request, true)
            console.log('⬛ post /api/v1/directory/record/filter',{
                "body": request,
                'response': result
            })
            result.res.ok ? resolve() : reject()
        })
    })
    it('POST: /api/v1/directory/record/filter', function () {
        return new Promise(async (resolve, reject) => {
            const request = {
                "active": true,
                "directoryId": "0b42c42b-4467-4dee-9085-54ba2aef287b",
                "type": 0,
                "operator": "like",
                "field": "code",
                "value": "1.2.5",
                "limit": 30,
                "offset": 0
            }
            const result = await window[api].fetch["post"]('/api/v1/directory/record/filter',request, true)
            console.log('⬛ post /api/v1/directory/record/filter',{
                "body": request,
                'response': result
            })
            result.res.ok ? resolve() : reject()
        })
    })
    it('POST: /api/v1/directory/record/filter', function () {
        return new Promise(async (resolve, reject) => {
            const request = {
                "active": true,
                "directoryId": "0b42c42b-4467-4dee-9085-54ba2aef287b",
                "type": 0,
                "operator": "like",
                "field": "code",
                "value": "1.2.",
                "limit": 30,
                "offset": 0
            }
            const result = await window[api].fetch["post"]('/api/v1/directory/record/filter',request, true)
            console.log('⬛ post /api/v1/directory/record/filter',{
                "body": request,
                'response': result
            })
            result.res.ok ? resolve() : reject()
        })
    })
    it('POST: /api/v1/directory/record/filter', function () {
        return new Promise(async (resolve, reject) => {
            const request = {
                "active": true,
                "directoryId": "0b42c42b-4467-4dee-9085-54ba2aef287b",
                "type": 0,
                "operator": "like",
                "field": "code",
                "value": "1.2",
                "limit": 30,
                "offset": 0
            }
            const result = await window[api].fetch["post"]('/api/v1/directory/record/filter',request, true)
            console.log('⬛ post /api/v1/directory/record/filter',{
                "body": request,
                'response': result
            })
            result.res.ok ? resolve() : reject()
        })
    })
})

describe.skip('Пагинация справочников', async function () {
    this.timeout(10000);""
    it('GET: /api/v1/directory/record', function () {
        return new Promise(async (resolve, reject) => {
            const request = {
                "active": true,
                "directoryId": "0b42c42b-4467-4dee-9085-54ba2aef287b",
                "limit": 6,
                "offset": 6
            }
            const result = await window[api].fetch["get"]('/api/v1/directory/record',request, true)
            console.log('⬛ get /api/v1/directory/record',{
                "body": request,
                'response': result
            })
            result.res.ok ? resolve() : reject()
        })
    })
    it('GET: /api/v1/directory/record', function () {
        return new Promise(async (resolve, reject) => {
            const request = {
                "active": true,
                "directoryId": "0b42c42b-4467-4dee-9085-54ba2aef287b",
                "limit": 6,
                "offset": 12
            }
            const result = await window[api].fetch["get"]('/api/v1/directory/record',request, true)
            console.log('⬛ get /api/v1/directory/record',{
                "body": request,
                'response': result
            })
            result.res.ok ? resolve() : reject()
        })
    })
})

describe.skip('Фльтрация правил', async function () {
    this.timeout(10000);""
    it('POST: /api/v1/rule/filter', function () {
        return new Promise(async (resolve, reject) => {
            const request = {
                "active": true,
                "type": 0,
                "operator": "like",
                "field": "interactionCode",
                "value": "ку",
                "limit": 30,
                "offset": 0
            }
            const result = await window[api].fetch["post"]('/api/v1/rule/filter',request, true)
            console.log('⬛ post /api/v1/rule/filter',{
                "body": request,
                'response': result
            })
            result.res.ok ? resolve() : reject()
        })
    })
    it('POST: /api/v1/rule/filter', function () {
        return new Promise(async (resolve, reject) => {
            const request = {
                "active": true,
                "type": 0,
                "operator": "like",
                "field": "interactionCode",
                "value": "",
                "limit": 30,
                "offset": 0
            }
            const result = await window[api].fetch["post"]('/api/v1/rule/filter',request, true)
            console.log('⬛ post /api/v1/rule/filter',{
                "body": request,
                'response': result
            })
            result.res.ok ? resolve() : reject()
        })
    })
    it('POST: /api/v1/rule/filter', function () {
        return new Promise(async (resolve, reject) => {
            const request = {
                "active": true,
                "type": 0,
                "operator": "like",
                "field": "interactionCode",
                "value": "re",
                "limit": 30,
                "offset": 0
            }
            const result = await window[api].fetch["post"]('/api/v1/rule/filter',request, true)
            console.log('⬛ post /api/v1/rule/filter',{
                "body": request,
                'response': result
            })
            result.res.ok ? resolve() : reject()
        })
    })
    it('POST: /api/v1/rule/filter', function () {
        return new Promise(async (resolve, reject) => {
            const request = {
                "active": true,
                "type": 0,
                "operator": "like",
                "field": "interactionName",
                "value": "Рэмд",
                "limit": 30,
                "offset": 0
            }
            const result = await window[api].fetch["post"]('/api/v1/rule/filter',request, true)
            console.log('⬛ post /api/v1/rule/filter',{
                "body": request,
                'response': result
            })
            result.res.ok ? resolve() : reject()
        })
    })
    it('POST: /api/v1/rule/filter', function () {
        return new Promise(async (resolve, reject) => {
            const request = {
                "active": true,
                "type": 0,
                "operator": "like",
                "field": "interactionName",
                "value": "Рэмд.",
                "limit": 30,
                "offset": 0
            }
            const result = await window[api].fetch["post"]('/api/v1/rule/filter',request, true)
            console.log('⬛ post /api/v1/rule/filter',{
                "body": request,
                'response': result
            })
            result.res.ok ? resolve() : reject()
        })
    })
    it('POST: /api/v1/rule/filter', function () {
        return new Promise(async (resolve, reject) => {
            const request = {
                "active": true,
                "type": 0,
                "operator": "like",
                "field": "interactionName",
                "value": "Рэмд.Рассылка",
                "limit": 30,
                "offset": 0
            }
            const result = await window[api].fetch["post"]('/api/v1/rule/filter',request, true)
            console.log('⬛ post /api/v1/rule/filter',{
                "body": request,
                'response': result
            })
            result.res.ok ? resolve() : reject()
        })
    })
})

describe.skip('Фльтрация подписок', async function () {
    this.timeout(10000);""
    it('POST: /api/v1/subscription/filter', function () {
        return new Promise(async (resolve, reject) => {
            const request = {
                "active": true,
                "type": 0,
                "operator": "like",
                "field": "recipientCode",
                "value": "e",
                "limit": 30,
                "offset": 0
            }
            const result = await window[api].fetch["post"]('/api/v1/subscription/filter',request, true)
            console.log('⬛ post /api/v1/subscription/filter',{
                "body": request,
                'response': result
            })
            result.res.ok ? resolve() : reject()
        })
    })
    it('POST: /api/v1/subscription/filter', function () {
        return new Promise(async (resolve, reject) => {
            const request = {
                "active": true,
                "type": 0,
                "operator": "like",
                "field": "recipientName",
                "value": "Е",
                "limit": 30,
                "offset": 0
            }
            const result = await window[api].fetch["post"]('/api/v1/subscription/filter',request, true)
            console.log('⬛ post /api/v1/subscription/filter',{
                "body": request,
                'response': result
            })
            result.res.ok ? resolve() : reject()
        })
    })
    it('POST: /api/v1/subscription/filter', function () {
        return new Promise(async (resolve, reject) => {
            const request = {
                "active": true,
                "type": 0,
                "operator": "like",
                "field": "recipientName",
                "value": "Еа",
                "limit": 30,
                "offset": 0
            }
            const result = await window[api].fetch["post"]('/api/v1/subscription/filter',request, true)
            console.log('⬛ post /api/v1/subscription/filter',{
                "body": request,
                'response': result
            })
            result.res.ok ? resolve() : reject()
        })
    })
})

describe.skip('Обновление подписки', async function () {
    this.timeout(10000);""
    it('PUT: /api/v1/subscription 1LmLhJIxZndh', function () {
        return new Promise(async (resolve, reject) => {
            const request = {
                "id": "094454d2-6dce-11ee-b962-0242ac120002",
                "active": true,
                "startAt": "2023-11-13T07:38:00.000Z",
                "endAt": "2023-11-26T07:38:00.000Z"
            }
            const result = await window[api].fetch["put"]('/api/v1/subscription',request, true)
            console.log('⬛ put /api/v1/subscription',{
                "body": request,
                'response': result
            })
            result.res.ok ? resolve() : reject()
        })
    })

    it('GET: /api/v1/subscription =czFqmKbrg+p', function () {
        return new Promise(async (resolve, reject) => {
            const request = {
                "active": true,
                "limit": 6,
                "offset": 0
            }
            const result = await window[api].fetch["get"]('/api/v1/subscription',request, true)
            console.log('⬛ get /api/v1/subscription',{
                "body": request,
                'response': result
            })
            result.res.ok ? resolve() : reject()
        })
    })
})

describe.skip('Пагинация подписок', async function () {
    this.timeout(10000);""
    it('GET: /api/v1/subscription', function () {
        return new Promise(async (resolve, reject) => {
            const request = {
                "active": true,
                "limit": 12,
                "offset": 0
            }
            const result = await window[api].fetch["get"]('/api/v1/subscription',request, true)
            console.log('⬛ get /api/v1/subscription',{
                "body": request,
                'response': result
            })
            result.res.ok ? resolve() : reject()
        })
    })
    it('GET: /api/v1/subscription', function () {
        return new Promise(async (resolve, reject) => {
            const request = {
                "active": true,
                "limit": 12,
                "offset": 12
            }
            const result = await window[api].fetch["get"]('/api/v1/subscription',request, true)
            console.log('⬛ get /api/v1/subscription',{
                "body": request,
                'response': result
            })
            result.res.ok ? resolve() : reject()
        })
    })
    it('GET: /api/v1/subscription', function () {
        return new Promise(async (resolve, reject) => {
            const request = {
                "active": true,
                "limit": 12,
                "offset": 0
            }
            const result = await window[api].fetch["get"]('/api/v1/subscription',request, true)
            console.log('⬛ get /api/v1/subscription',{
                "body": request,
                'response': result
            })
            result.res.ok ? resolve() : reject()
        })
    })
    it('GET: /api/v1/subscription', function () {
        return new Promise(async (resolve, reject) => {
            const request = {
                "active": true,
                "limit": 12,
                "offset": 12
            }
            const result = await window[api].fetch["get"]('/api/v1/subscription',request, true)
            console.log('⬛ get /api/v1/subscription',{
                "body": request,
                'response': result
            })
            result.res.ok ? resolve() : reject()
        })
    })
})
