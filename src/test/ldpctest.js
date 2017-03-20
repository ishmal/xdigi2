
import {Ldpc} from "../lib/ldpc";

describe("LDPC tests", function(){

  it("should initialize properly", function(){
    let ldpc;
    expect(function() {
      ldpc = new Ldpc();
    }).not.toThrow();
    expect(ldpc).not.toBe(null);
  });

  it("should encode a string without exceptions", function(){
    let ldpc = new Ldpc();
    let plain = "the quick brown fox";
    let res = ldpc.encode(plain, "648", "1/2");
  });

});
