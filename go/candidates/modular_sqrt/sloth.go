package modular_sqrt

import (
	"fmt"
	"math/big"
	"strconv"
	"time"
)

type cipherPair struct {
	c        *big.Int
	positive bool
}

func mod_exp(base, exponent, modulus *big.Int) *big.Int {
	return new(big.Int).Exp(base, exponent, modulus)
}

func quad_res(x, p *big.Int) bool {
	//println("p-1/2="+new(big.Int).Div(Sub(p, big.NewInt(1)), big.NewInt(2)).String())
	t := new(big.Int).Exp(x, new(big.Int).Div(Sub(p, big.NewInt(1)), big.NewInt(2)), p)
	//println("x^p-1/2: "+t.String())
	return t.Cmp(big.NewInt(1)) == 0
}

func Mul(x, y *big.Int) *big.Int {
	return big.NewInt(0).Mul(x, y)
}

func Add(x, y *big.Int) *big.Int {
	return big.NewInt(0).Add(x, y)
}

func Sub(x, y *big.Int) *big.Int {
	return big.NewInt(0).Sub(x, y)
}

func Div(x, y *big.Int) *big.Int {
	return big.NewInt(0).Div(x, y)
}

func mod_sqrt(x, p *big.Int) *big.Int {
	y := big.NewInt(0)

	if quad_res(x, p) {
		y = new(big.Int).Exp(x, Div(Add(p, big.NewInt(1)), big.NewInt(4)), p)
	} else {
		x := big.NewInt(0).Mod(big.NewInt(0).Neg(x), p)
		y = new(big.Int).Exp(x, Div(Add(p, big.NewInt(1)), big.NewInt(4)), p)
	}

	return y
}

func square(y, p *big.Int) *big.Int {
	return big.NewInt(0).Exp(y, big.NewInt(2), p)
}

func verify(t int, x, y, p *big.Int) bool {
	if !quad_res(x, p) {
		x = big.NewInt(0).Mod(big.NewInt(0).Neg(x), p)
	}

	for i := 0; i < t; i++ {
		y = square(y, p)
	}

	return x.Cmp(y) == 0
}

//var x, _ =new(big.Int).SetString("48579348758743879",0)
// pretty useless function at this stage, will remove later
func modsqrt_op(t int, x, p *big.Int) *big.Int {
	y := x

	for i := 0; i < t; i++ {
		y = mod_sqrt(y, p)
	}

	return y
}

func encode_32(t int, m uint32, p *big.Int) cipherPair {
	encrypted_m := big.NewInt(int64(m))

	for x := 0; x < t; x++ {
		encrypted_m = square(encrypted_m, p)
	}

	if quad_res(big.NewInt(int64(m)), p) {
		return cipherPair{
			encrypted_m, true,
		}
	} else {
		return cipherPair{
			encrypted_m, false,
		}
	}
}

func encodeByte(t int, m []byte, p *big.Int) cipherPair {
	encrypted_m := new(big.Int).SetBytes(m)

	for x := 0; x < t; x++ {
		encrypted_m = square(encrypted_m, p)
	}

	if quad_res(new(big.Int).SetBytes(m), p) {
		return cipherPair{
			encrypted_m, true,
		}
	}

	return cipherPair{
		encrypted_m, false,
	}
}

func decode(t int, pair cipherPair, p *big.Int) *big.Int {
	c := pair.c
	z := modsqrt_op(t, c, p)

	if pair.positive {
		return z
	}

	return big.NewInt(0).Mod(big.NewInt(0).Neg(z), p)
}

// something to keep in mind when setting base of SetString Argument:
// The base argument must be 0 or a value between 2 and MaxBase. If the base
// is 0, the string prefix determines the actual conversion base. A prefix of
// ``0x'' or ``0X'' selects base 16; the ``0'' prefix selects base 8, and a
// ``0b'' or ``0B'' prefix selects base 2. Otherwise the selected base is 10.
// Hence long as we set 0x, the setstring automatically converts to base 10

// FixedDelay arguments [ prime number p, starting value x, iteration count t ]
func FixedDelay(args []string) {
	// t as the length of the hash chain
	var p, _ = new(big.Int).SetString(args[0], 0)
	var x, _ = new(big.Int).SetString(args[1], 0)
	var t, _ = strconv.ParseInt(args[2], 10, 64)

	fmt.Println("Iteration Count: ", int(t), "\t Starting Value: ", x.Int64())

	start := time.Now()
	y := modsqrt_op(int(t), x, p)
	cur := time.Now()
	elapsed := cur.Sub(start).Seconds()

	println("Delay Elapsed: ", fmt.Sprintf("%.5f", elapsed), "sec")
	fmt.Println("Ending Value: ", y.String())

	start = time.Now()

	println(verify(int(t), x, y, p))

	cur = time.Now()
	elapsed = cur.Sub(start).Seconds()

	println("Verify Elapsed: ", fmt.Sprintf("%.5f", elapsed), "sec")
}

// ElapsedProof arguments [ prime number, starting value ]
// TODO: not ready
func ElapsedProof(args []string) {
	// t as the length of the hash chain
	// we set t as a certain multiple of the bitsize of security parameter "for now"
	t := 1000
	var p, _ = new(big.Int).SetString(args[0], 0)
	var x, _ = new(big.Int).SetString(args[1], 0)

	overallStart := time.Now()

	for i := 0; i < 10; i++ {
		start := time.Now()
		x = modsqrt_op(t, x, p)
		cur := time.Now()
		elapsed := cur.Sub(start).Seconds()
		println("Delay Elapsed: ", fmt.Sprintf("%.5f", elapsed), "sec")
		println("interation:", t)
		println("ending value:", x)
	}

	overallCur := time.Now()
	overallElapsed := overallCur.Sub(overallStart).Seconds()
	println("totally elapsed: ", fmt.Sprintf("%.5f", overallElapsed), "sec")

	//println(verify(1000,x,y,p))
	//cur=time.Now()
	//elapsed=cur.Sub(start).Seconds()
	//println("Verify Elapsed: ", fmt.Sprintf("%.2f", elapsed), "sec")
}
