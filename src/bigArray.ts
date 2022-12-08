export class BigArray<T> extends Array<T> {
    async asyncForEach(job: (value: T, key: number) => Promise<void>): Promise<void> {
        for (let i = 0; i < this.length; i++) {
            const element = this[i];
            await job(element, i);
        }
    }
    override slice(start?: number | undefined, end?: number | undefined): BigArray<T> {
        return new BigArray(...super.slice(start, end));
    }
    async asyncSlowMap<T1>(job: (value: T, key: number) => Promise<T1>, jobs: number): Promise<BigArray<T1>> {
        const real_jobs = Math.round(jobs);

        const arr = new BigArray<T1>();
        arr.length = this.length;
        const jobSize = this.length / real_jobs;

        for (let i = 0; i < real_jobs; i++) {
            await new Promise<void>((res, rej) =>
                setTimeout(async () => {
                    try {
                        const to_process = this.slice(jobSize * i, jobSize * (i + 1));
                        await to_process.asyncForEach(async (x, at) => {
                            const index = at + jobSize * i;
                            arr[index] = await job(x, index);
                        });
                        res();
                    } catch (e) {
                        rej(e);
                    }
                }),
            );
        }
        return arr;
    }
    async slowMap<T1>(job: (value: T, key: number) => T1, jobs: number): Promise<BigArray<T1>> {
        return await this.asyncSlowMap(async (value, key) => job(value, key), jobs);
    }
    async slowLoop(job: (value: T, key: number) => void, jobs: number): Promise<void> {
        this.slowMap(job, jobs);
    }

    override flatMap<U, This = undefined>(
        callback: (this: This, value: T, index: number, array: T[]) => U | readonly U[],
        thisArg?: This | undefined,
    ): BigArray<U> {
        const x = super.flatMap(callback, thisArg);
        return new BigArray(...x);
    }

    async slowFlatMap<T1>(job: (value: T, key: number) => T1[], jobs: number): Promise<BigArray<T1>> {
        const res = await this.slowMap(job, jobs);
        return res.flatMap((x) => x);
    }
    async AsyncSlowFlatMap<T1>(
        job: (value: T, key: number) => Promise<Array<T1>>,
        jobs: number,
    ): Promise<BigArray<T1>> {
        const res = await this.asyncSlowMap(job, jobs);
        return res.flatMap((x) => x);
    }
}
