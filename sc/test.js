

class Test {
    init(){}

    can_update(data) {
        return blockchain.requireAuth(blockchain.contractOwner(), "active");
    }


    // ひたすらBCがに書き込む関数
    iterMapPut (iterTime) {
        for ( let i = 0; i < iterTime; i++ ) {
            const obj = {
                hello: 'world',
                thisis: 'test',
                now:  `${i + 1}times`,
            };

            storage.mapPut('key', `${i}`, JSON.stringify(obj));
        }
        return;
    }

    // ひたすらBCがに書き込む関数
    iterPut (iterTime) {
        for ( let i = 0; i < iterTime; i++ ) {
            const obj = {
                hello: 'world',
                thisis: 'test',
                now:  `${i + 1}times`,
            };

            storage.Put(`${i}`, JSON.stringify(obj));
        }
        return;
    }


}



module.exports = Test;