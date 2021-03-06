// Require Test Framework Jasmine.
// Assigning to global variable `jasmineRequire` is because jasmine-html.js
// uses this global variable which jasmine.js does not define
// since jasmine.js treats CommonJS environment as non-browser environment.
jasmineRequire = require('jasmine-core/lib/jasmine-core/jasmine')
require('jasmine-core/lib/jasmine-core/jasmine-html')
require('jasmine-core/lib/jasmine-core/boot')
require('../jasmine.css')

var promiseRequire = require('../../promise-require')
var Q = require('q')

describe('promise-require module: ', function () {
  it('exports a function', function () {
    expect(typeof promiseRequire).toBe('function')
  })

  describe('promises to load a JS file: ', function () {
    it('fulfill when loaded', function (done) {
      promiseRequire('asset/a.js')
      .then(function () {
        console.log('The promise to load a.js was resolved')
        expect(typeof globalA).toBe('boolean')
        expect(globalA).toBe(true)
        done()
      })
    })

    it('fulfill with the specified global variable', function (done) {
      promiseRequire('asset/b.js', {
        fulfilledWith: 'globalB'
      })
      .then(function () {
        console.log('The promise to load b.js was resolved')
        expect(typeof globalB).toBe('boolean')
        expect(globalB).toBe(true)
        done()
      })
    })

    it('fulfill with multiple specified global variables', function (done) {
      promiseRequire('asset/multiple-global-vars.js', {
        fulfilledWith: ['globalVar1', 'globalVar2', 'globalVar3']
      })
      .then(function (globalVars) {
        console.log('The promise to load b.js was resolved')
        expect(globalVars[0]).toBe(true)
        expect(globalVars[1]).toBe(1)
        expect(globalVars[2]).toEqual({})
        done()
      })
    })

    it('fulfill with the return of specified function', function (done) {
      promiseRequire('asset/fulfilled-with-function-result.js', {
        fulfilledWith: function () {
          return window.fulfillWithFunctionResult;
        }
      })
      .then(function (fulfillWithFunctionResult) {
        console.log('The promise to load fulfilled-with-function-result.js was resolved');
        expect(fulfillWithFunctionResult).toBe(true)
        done()
      })
    })

    it('reject with an error event object if not exist', function (done) {
      promiseRequire('asset/nonexistent.js')
      .then(function () {
        expect('onFulfiled callback ').toBe('not invoked')
        done()
      }, function (errorEvent) {
        console.warn('Error event %O to load nonexistent.js', errorEvent)
        expect(typeof errorEvent).not.toBe('undefined')
        expect(errorEvent instanceof window.Event).toBe(true)
        expect(errorEvent.type).toBe('error')
        done()
      })
    })

    it('not load the JS file again which has beed required to load', function (done) {
      promiseRequire('asset/require-multiple-times.js', {
        fulfilledWith: 'requireMultipletimes'
      })
      .then(function (requireMultipletimes) {
        expect(requireMultipletimes).toBe(1)
        return promiseRequire('asset/require-multiple-times.js', {
          fulfilledWith: 'requireMultipletimes'
        })
      })
      .then(function (requireMultipletimes) {
        expect(requireMultipletimes).toBe(1)
        done()
      })
    })

    it('support set custom container of script element', function (done) {
      var optionsContainer = document.getElementById('container')
      // URL is relative container's document
      promiseRequire('in-container.js', {
        container: optionsContainer.contentDocument.head
      })
      .then(function () {
        expect(optionsContainer.contentWindow.inContainer).toBe(true)
        done()
      })
    })
  })

  describe('promises to load a CSS file: ', function (done) {
    it('fulfill when loaded', function (done) {
      promiseRequire('asset/x.css')
      .then(function () {
        expect(getComputedStyle(document.getElementById('x')).display).toBe('none')
        done()
      })
    })

    it('reject with an error event object if not exist', function (done) {
      promiseRequire('asset/nonexistent.css')
      .then(function () {
        expect('onFulfiled callback ').toBe('not invoked')
        done()
      }, function (errorEvent) {
        console.warn('Error event %O to load nonexistent.js', errorEvent)
        expect(typeof errorEvent).not.toBe('undefined')
        expect(errorEvent instanceof window.Event).toBe(true)
        expect(errorEvent.type).toBe('error')
        done()
      })
    })

    it('not load the CSS file again which has been required to load', function (done) {
      var requireMultipleTimes = document.getElementById('require-multiple-times')
      promiseRequire('asset/require-multiple-times.css')
      .then(function () {
        expect(getComputedStyle(requireMultipleTimes).display).toBe('none')
        requireMultipleTimes.style.display = 'block'
        return promiseRequire('asset/require-multiple-times.css')
      })
      .then(function () {
        expect(getComputedStyle(requireMultipleTimes).display).toBe('block')
        done()
      })
    })

    it('support set custom container of link element', function (done) {
      var optionsContainer = document.getElementById('container')
      // URL is relative container's document
      promiseRequire('in-container.css', {
        container: optionsContainer.contentDocument.head
      })
      .then(function () {
        var inContainer = optionsContainer.contentDocument.getElementById('in-container')
        expect(getComputedStyle(inContainer).display).toBe('none')
        done()
      })
    })
  })
})
