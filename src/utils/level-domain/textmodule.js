const flatted = require('flatted');

class D {
  constructor(self) {
    this.self = self;
  }

  say() {
    console.log(this.a);
  }
}

class A {
  constructor(self) {
    process.nextTick(() => {
      this.b = self.b;
      this.c = self.c;
    })
  }
}

class B {
  constructor(self) {
    process.nextTick(() => {
      this.a = self.a;
      this.c = self.c;
    })
  }
}

class C extends D {
  constructor(self) {
    super(self);

    process.nextTick(() => {
      this.a = self.a;
      this.b = self.c;
    });
  }
}

class Master {
  constructor() {
    this.a = new A(this);
    this.b = new B(this);
    this.c = new C(this);

    return new Promise(res => setImmediate(() => {
      res(this);
    }));
  }
}

(async function() {
  const m = await new Master();
  const str = flatted.stringify(m);
  console.log(str);
})();
