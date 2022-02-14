/*
 * Copyright (c) 2021 Elastos Foundation
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import BrowserFS from 'browserfs';
// import Stats from "browserfs/dist/node/core/node_fs_stats";
// const fs = BrowserFS.BFSRequire('fs');

// const {
//   read,
//   readSync,
//   existsSync,
//   mkdirSync,
//   readdirSync,
//   readFileSync,
//   renameSync,
//   rmdirSync,
//   statSync,
//   writeFileSync,
//   unlinkSync,
//   lstatSync
// } = fs;

// BrowserFS.install(window)
BrowserFS.configure({
  fs: 'LocalStorage',
  options: {}
}, function(e) {
  if (e) {
    throw e;
  }
  else {
    console.log("BrowserFS initialization complete");
    // const fs = BrowserFS.BFSRequire('fs');
    // fs.readdir('/', function(e, contents) {
    //   // etc.
    //   console.log(`contents of / : ${contents}`);
    // });
    // window.fs = window.require('fs');
    showContents();
  }
});

export function showContents() {
  const fs = BrowserFS.BFSRequire('fs');
  fs.readdir('/', function(e, contents) {
    // etc.
    console.log(`contents of / : ${contents}`);
  });
}

// export {
//   read,
//   readSync,
//   existsSync,
//   mkdirSync,
//   readdirSync,
//   readFileSync,
//   renameSync,
//   rmdirSync,
//   statSync,
//   writeFileSync,
//   unlinkSync,
//   lstatSync
// };
