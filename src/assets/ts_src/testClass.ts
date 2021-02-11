export class TestClass
{
    constructor()
    {
        //console.log(this.WordToNumber("twenty-seven"));
        //console.log(this.WordToNumber("five hundred sixty-two"));
        //console.log(this.WordToNumber("five hundred and sixty-two"));
        /*(console.log(this.WordToNumber_ZeroToOneHundred("sixty"));
        console.log(this.WordToNumber_ZeroToOneHundred("seventy-four"));
        console.log(this.WordToNumber_ZeroToOneHundred("one hundred"));
        console.log(this.WordToNumber_ZeroToOneHundred("zero"));
        console.log(this.WordToNumber_ZeroToOneHundred("26"));*/
    }

    private WordToNumber(wordNumber: string): number //WIP
    {
        var words: string[] = wordNumber.replace(/and/g, "-").replace(/ /g, "-").split("-");
        words = words.filter((value: string) => value !== "");
        console.log(words);
        var digits: string[] = [];
        for (let i = 0, previousValue = ""; i < words.length; i++)
        {
            var number: string;

            if (words[i] === "hundred") { number = "00"; }
            else
            {
                var num: SmallNumbers = (<any>SmallNumbers)[words[i]];
                if (num === undefined || isNaN(num)) { throw new RangeError(`'${words[i]}' was not in the range of the 'numbers' enum`); }
                else { number = num.toString(); }
            }

            //if (i === words.length - 1) { digits.push(number); }
        }

        var numberString: string = digits[digits.length - 1];
        for (let i = digits.length - 1; i > 0; i--)
        {
            if (digits[i] == "00") {  }
            else if (digits[i].length == 2 && digits[i].endsWith("0")) {}
        }

        return parseInt(digits.join());
    }

    //Because this is only working with small numbers it is easy to convert, I am working on a large number converter.
    //It does not check if it is a small number so it could return unexpected results.
    private WordToNumber_ZeroToOneHundred(wordNumber: string): number
    {
        var testInt: number = parseInt(wordNumber);
        if (!isNaN(testInt)) { return testInt; }

        var words: string[] = wordNumber.replace(/and/g, "-").replace(/ /g, "-").split("-");
        words = words.filter((value: string) => value !== "");
        var digits: string[] = [];
        for (let i = 0; i < words.length; i++)
        {
            var number: string;

            if (words[i] === "hundred") { digits.push("00"); }
            else
            {
                var num: SmallNumbers = (<any>SmallNumbers)[words[i]];
                if (num === undefined || isNaN(num)) { throw new RangeError(`'${words[i]}' was not in the range of the 'numbers' enum`); }
                else { digits.push(num.toString()); }
            }
        }

        var result: string;
        if (digits.length == 2 && digits[1] == "00") { result = digits[0] + digits[1]; }
        else if (digits.length == 2 && digits[1] != "0") { result = digits[0][0] + digits[1]; }
        else { result = digits[0]; }

        return parseInt(result);
    }
}

enum SmallNumbers
{
    zero = 0,
    one = 1,
    two = 2,
    three = 3,
    four = 4,
    five = 5,
    six = 6,
    seven = 7,
    eight = 8,
    nine = 9,
    ten = 10,
    eleven = 11,
    twelve = 12,
    thirteen = 13,
    fourteen = 14,
    fifteen = 15,
    sixteen = 16,
    seventeen = 17,
    eighteen = 18,
    nineteen = 19,
    twenty = 20,
    thirty = 30,
    forty = 40,
    fifty = 50,
    sixty = 60,
    seventy = 70,
    eighty = 80,
    ninety = 90
}