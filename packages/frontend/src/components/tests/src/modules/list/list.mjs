let base = ''
let path = (location.hostname === 'localhost')
    ? location.host
    : location.pathname

let list =
    [{
        path: 'localhost:1111',
        test: '/tests/core.mjs'
    },{
        path: '/contract-deals/',
        test: '/tests/core.mjs'
    },{
        path: 'localhost:6040',
        test: '/tests/game/monopoly.mjs'
    },{
        path: 'localhost:4999',
        test: '/tests/wallet.mjs'
    },{
        path: 'localhost:7030',
        test: '/tests/wallet.mjs'
    },{
        path: 'localhost:8020',
        test: '/tests/faucet.mjs'
    },{
        path: 'localhost:4060',
        test: '/tests/game.mjs'
    }]

let test = {}
let dictionary = list

let test = (path = {}) => {
    return new Promise(async (resolve, reject) => {

        let pathname = {}
        if(!isEmpty(location.pathname[1])) {
            pathname = location.pathname
            pathname = pathname.split('/')
            if(pathname[1].split('-').length >1) {
                pathname = `${location.origin}/${pathname[1]}/test.${pathname[1]}.mjs`
            } else {
                switch (pathname[1]) {
                    case 'dev':
                        pathname = `${location.origin}/test.index.mjs`
                        break
                    default:
                        console.log('неизвестно какой тест подключать',pathname)
                        pathname = `${location.origin}/test.index.mjs`
                        break
                }
            }
        } else {
            pathname = '/test.index.mjs'
        }
        await tests(pathname,'tests')
    })
}


export default () => {
    return new Promise((resolve, reject) => {
        resolve({
            dict: dictionary,
            test: test,
        })
    })
}