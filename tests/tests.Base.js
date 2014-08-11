var chai = require('chai');
var should = chai.should();
var frog = require('../frog.node');

// run:
// $ mocha -u tdd -R spec tests/

suite('frog.Base', function () {

    var obj = {
        test : true,
        a    : {
            b : {
                c : 'c'
            }
        },
        d    : 'd',
        e    : null,
        f    : '',
        g    : 0,
        h    : {},
        i    : []
    };

    suite('.set()', function () {

        test('.set(str, value), non-dotted', function () {

            var base;
            base = new frog.Base();

            // ---

            base.set('test', 'test');

            // ---

            var res = base.get();

            // ---

            res.should.have.property('test');
            res.test.should.equal('test');


        });
        test('.set(str), non-dotted, no value', function () {

            var base;
            base = new frog.Base();

            // ---

            base.set('test');

            // ---

            var res = base.get();

            // ---

            res.should.have.property('test');
            (res.test === null).should.equal(true); // null


        });
        test('.set(str.str.str, value), dotted', function () {

            var base;
            base = new frog.Base();

            // ---

            base.set('test.a', 'test');

            // ---

            var res = base.get();

            // ---

            res.should.have.property('test');
            res.test.should.have.property('a');
            res.test.a.should.equal('test');

        });
        test('.set(str.str.str), dotted, no value', function () {

            var base;
            base = new frog.Base();

            // ---

            base.set('test.a');

            // ---

            var res = base.get();

            // ---

            res.should.have.property('test');
            res.test.should.have.property('a');
            should.not.exist(res.test.a);
            (res.test.a === null).should.equal(true);


        });

    });
    suite('.get()', function () {

        var base;
        base = new frog.Base();
        base.set('test', {
            a : {
                b : {
                    c : 'c'
                }
            },
            b : {},
            c : [],
            d : '',
            e : 0,
            f : null,
            g : undefined
        });

        // ---

        test('.get(), no args', function () {

            var res;

            // ---

            res = base.get();

            // ---

            res.should.have.property('test');
            res.test.should.have.property('a');
            res.test.a.should.have.property('b');
            res.test.a.b.should.have.property('c');
            res.test.a.b.c.should.equal('c');

        });
        test('.get(str), non-dotted', function () {

            var res;

            // ---

            res = base.get('test');

            // ---

            res.should.have.property('a');
            res.a.should.have.property('b');
            res.a.b.should.have.property('c');
            res.a.b.c.should.equal('c');

        });
        test('.get(str.str.str), dotted', function () {

            var res1, res2, res3, res4, res5;

            res1 = base.get('test.a');
            res2 = base.get('test.a.b');
            res3 = base.get('test.a.b.c');
            res4 = base.get('test.a.b.c.d'); // mising at any end
            res5 = base.get('test.a.k.l');   // missing in any middle
            res5 = base.get('wrong.a.b.c');  // missing at any start

            // ---

            res1.should.have.property('b');
            res1.b.should.have.property('c');
            res1.b.c.should.equal('c');

            // ---

            res2.should.have.property('c');
            res2.c.should.equal('c');

            // ---

            res3.should.equal('c');

            // ---

            should.not.exist(res4); // undefined
            (typeof res4 === 'undefined').should.equal(true);
            should.not.exist(res5); // undefined
            (typeof res5 === 'undefined').should.equal(true);

        });
        test('.get(), empty results, obj, arr, str, int, null, undefined', function () {

            var res;

            // ---

            res = base.get();

            // ---

            should.exist(res.test.b); // {}
            should.exist(res.test.c); // []
            should.exist(res.test.d); // ''
            should.exist(res.test.e); // 0

            res.test.b.should.be.a('object'); // {}
            res.test.c.should.be.a('array');  // []
            res.test.d.should.be.a('string'); // ''
            res.test.e.should.be.a('number');  // 0

            should.not.exist(res.test.f); // undefined
            (res.test.f === null).should.equal(true); // null

            should.not.exist(res.test.g); // undefined
            (res.test.g === undefined).should.equal(true); // undefined

        });

    });

});