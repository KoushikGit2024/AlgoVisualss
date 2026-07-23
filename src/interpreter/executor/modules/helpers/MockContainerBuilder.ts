// import type { CppValue } from "../../../../types";
import { cloneRuntimeValue, makeMockContainer } from "../../../utils/helpers";

export function createMockContainer(initialData: any[], typeLower: string = ""): Record<string, any> {
  const isPriorityQueue = typeLower.includes("priority_queue");
  const isQueue = typeLower === "queue" || (typeLower.includes("queue") && !isPriorityQueue);

  const container: Record<string, any> = {
    ...makeMockContainer(initialData),
    push_back(val: any) {
      this.data.push(cloneRuntimeValue(val));
      return val;
    },
    push(val: any) {
      this.data.push(cloneRuntimeValue(val));
      if (this.__isHeap) this.__siftUp(this.data.length - 1);
      return val;
    },
    push_front(val: any) {
      this.data.unshift(cloneRuntimeValue(val));
      return val;
    },
    insert(arg1: any, arg2?: any) {
      if (arg2 !== undefined) {
        const pos = typeof arg1 === "number" ? arg1 : 0;
        this.data.splice(pos, 0, cloneRuntimeValue(arg2));
        return arg2;
      } else {
        this.data.push(cloneRuntimeValue(arg1));
        return arg1;
      }
    },
    pop_back() {
      return this.data.pop();
    },
    pop() {
      if (this.__isHeap && this.data.length > 0) {
        const top = this.data[0];
        const last = this.data.pop();
        if (this.data.length > 0 && last !== undefined) {
          this.data[0] = last;
          this.__siftDown(0);
        }
        return top;
      }
      if (this.__isQueue) {
        return this.data.shift();
      }
      return this.data.pop();
    },
    pop_front() {
      return this.data.shift();
    },
    remove(val: any) {
      const idx = this.data.indexOf(val);
      if (idx !== -1) {
        this.data.splice(idx, 1);
        return true;
      }
      return false;
    },
    erase(val: any) {
      if (val && typeof val === "object" && val.__isListIter) {
        const idx = this.data.indexOf(val.__iterValue);
        if (idx !== -1) {
          this.data.splice(idx, 1);
          return;
        }
      }
      const num = Number(val);
      if (!isNaN(num) && num >= 0 && num < this.data.length) {
        this.data.splice(num, 1);
      } else {
        const idx = this.data.indexOf(val);
        if (idx !== -1) this.data.splice(idx, 1);
      }
    },
    front() {
      return this.data.length > 0 ? this.data[0] : undefined;
    },
    back() {
      return this.data.length > 0 ? this.data[this.data.length - 1] : undefined;
    },
    top() {
      if (this.__isHeap) return this.data.length > 0 ? this.data[0] : undefined;
      return this.data.length > 0 ? this.data[this.data.length - 1] : undefined;
    },
    at(index: number) {
      if (index < 0 || index >= this.data.length) {
        throw new Error(
          `Memory Access Violation: Index ${index} is out of bounds (container size: ${this.data.length}).`,
        );
      }
      return this.data[index];
    },
    search(val: any) {
      return this.data.indexOf(val);
    },
    find(val: any) {
      return this.data.indexOf(val);
    },
    contains(val: any) {
      return this.data.includes(val);
    },
    size() {
      return this.data.length;
    },
    length() {
      return this.data.length;
    },
    empty() {
      return this.data.length === 0;
    },
    clear() {
      this.data = [];
    },
    print() {
      return `[${this.data.join(" -> ")}]`;
    },

    __isHeap: false,
    __isQueue: false,
    __cmp: null as ((a: any, b: any) => number) | null,

    __siftUp(i: number) {
      const cmp = this.__cmp ?? ((a: any, b: any) => b - a);
      while (i > 0) {
        const parent = (i - 1) >> 1;
        if (cmp(this.data[i], this.data[parent]) < 0) {
          [this.data[i], this.data[parent]] = [this.data[parent], this.data[i]];
          i = parent;
        } else break;
      }
    },
    __siftDown(i: number) {
      const n = this.data.length;
      const cmp = this.__cmp ?? ((a: any, b: any) => b - a);
      while (true) {
        let best = i;
        const l = 2 * i + 1;
        const r = 2 * i + 2;
        if (l < n && cmp(this.data[l], this.data[best]) < 0) best = l;
        if (r < n && cmp(this.data[r], this.data[best]) < 0) best = r;
        if (best === i) break;
        [this.data[i], this.data[best]] = [this.data[best], this.data[i]];
        i = best;
      }
    },
    __heapify() {
      for (let i = Math.floor(this.data.length / 2) - 1; i >= 0; i--) {
        this.__siftDown(i);
      }
    },
  };

  if (isPriorityQueue) {
    container.__isHeap = true;
    if (initialData.length > 0) container.__heapify();
  } else if (isQueue) {
    container.__isQueue = true;
  }

  return container;
}
