package main

import (
	"fmt"
	"os"

	sloth "./candidates/modular_sqrt"
)

var p1024 string = "26665316952145251691159678627219217222885850903741016853585447718947343212288750750268012668712469908106258613976547496870890438504017231007766799519535785905104605162203896873810538315838185502276890025696087480171103337359532995917850779890238106057070346163136946293278160601772800244012833993583077700483"
var p512 string = "1428747867218506432894623188342974573745986827958686951828141301796511703204477877094047850395093527438571991358833787830431256534283107665764428020239091"
var p256 string = "60464814417085833675395020742168312237934553084050601624605007846337253615407"
var p128 string = "271387921886905605025992265577018698667"
var p64 string = "9853393445385562019"

func main() {
	//command line interface arguments, note that the [0] in the list is the path to the program, might be useful later on
	//arguments [ security parameter , starting value x, iteration count t ]
	cliArgs := os.Args[1:]

	if len(cliArgs) < 2 {
		fmt.Println("Invalid Arguments From CLI")
		return
	}

	if cliArgs[0] == "64" {
		cliArgs[0] = p64
	} else if cliArgs[0] == "128" {
		cliArgs[0] = p128
	} else if cliArgs[0] == "256" {
		cliArgs[0] = p256
	} else if cliArgs[0] == "512" {
		cliArgs[0] = p512
	} else if cliArgs[0] == "1024" {
		cliArgs[0] = p1024
	} else {
		fmt.Println("Invalid Security Parameter")
		return
	}

	if len(cliArgs) < 3 {
		sloth.ElapsedProof(cliArgs)
	} else {
		sloth.FixedDelay(cliArgs)
	}
}
