import {Crc32} from "../lib/crc32";

describe("CRC tests", function(){

  it("should initialize properly", function(){
    let crc;
    expect(function(){
      crc = new Crc32();
    }).not.toThrow();
    expect(crc).not.toBe(null);
  });

  it("should calculate a proper crc32 of a string", function(){
    let str = "the quick brown fox";
    let exp = 0x91c102ca;
    let crc = new Crc32();
    let res = crc.ofString(str);
    expect(res).toEqual(exp);
  });

  /**
   * verify expected checkum with
   * @link http://www.sunshine2k.de/coding/javascript/crc/crc_js.html
   */
  it("should calculate a proper crc32 of a byte array", function(){
    let bytes = [0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39];
    let exp = 0xCBF43926;
    let crc = new Crc32();
    let res = crc.ofBytes(bytes);
    expect(res).toEqual(exp);
  });

  it("should break up a 32-bit int into 4 bytes", function(){
    let crc = new Crc32();
    let checksum = 0xCBF43926;
    let exp = [0xcb, 0xf4, 0x39, 0x26];
    let res = crc.intToBytes(checksum);
    expect(res).toEqual(exp);
  });

});
