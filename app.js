const { StaticPool, DynamicPool, isTimeoutError } = require("node-worker-threads-pool");

const statiscPool = new StaticPool({
    size: 4,
    task: n => {
        const num = this.workerData.num;
        for (let i = 0; i < num; i++)
            n += i;
        
        return n;
    },
    workerData: {
        num: 1000 * 1000 * 1000 //1 << 30,
    },
});

const dynamicPool = new DynamicPool(4);

const task1 = () => {
    // something heavy.
    const n = this.workerData.n;
    return n * 10;
}

const task2 = () => {
    // something heavy too.
    const n = this.workerData.n;
    const str = this.workerData.str;
    return str + `${n}`;
}

(async () => {
    try {
        for (let i = 0; i < 10; i++) {
            const res = await statiscPool.exec(i, 1000);
            console.log(`result${i}:`, res);

            const res1 = await dynamicPool.exec({
                    task: task1,
                    workerData: {
                        // some data
                        n: i
                    },
                },
                1000);
            console.log(res1);

            const res2 = await dynamicPool.exec({
                    task: task2,
                    workerData: {
                        // some data
                        n: i,
                        str: 'a'
                    },
                },
                1000);
            console.log(`   ${res2}`);
        }
    }
    catch (err) {
        console.log(`ERROR: ${err}`);
        if (isTimeoutError(err)) {
            // deal with timeout.
            console.log('TIMEOUT');
        }
        else {
            // deal with other errors.
            console.log('NOT A TIMEOUT');
        }
    }
    finally {
        statiscPool.destroy();
        dynamicPool.destroy();
    }
})();