#include <iostream>
#include <string>
#include <vector>

using namespace std;

vector<string> parseInputArray(string inp) {
    vector<string> res;

    if (inp.length() == 0)
        return res;

    string cur = "";
    int start = inp[0] == '[' ? 1 : 0;
    int end = inp.back() == ']' ? inp.length() - 2 : inp.length() - 1;
    for (int i = start; i <= end; i++) {
        if (inp[i] == ',') {
            res.push_back(cur);
            cur = "";
        } else cur += inp[i];
    }
    res.push_back(cur);

    return res;
}

enum RETURN_CODES {
    // Apollo defined
    AC = 0,
    WA = 3,
    PE = 4,

    // System defined
    TLE = 152,
    RTE = 139
};

const int NUM_ARGS = 10;
int main(int argc, char **argv) {
    if (argc - 1 < NUM_ARGS) {
        cout << "Usage: judge cachePath binaryName binaryPath lang [inputIDs,...] [inputPaths,...] [outputPaths,...] timeLimit directoryPathSeparator runScriptBinaryPath\n";
        return 1;
    }

    // Parse arguments.
    string cachePath(argv[1]);
    string binaryName(argv[2]);
    string binaryPath(argv[3]);
    string lang(argv[4]);
    vector<string> inputIDs = parseInputArray(string(argv[5]));
    vector<string> inputPaths = parseInputArray(string(argv[6]));
    vector<string> outputPaths = parseInputArray(string(argv[7]));
    string timeLimit(argv[8]);
    string directoryPathSeparator(argv[9]);
    string runScriptBinaryPath(argv[10]);

    // Judge each case.
    for (int testCase = 0; testCase < inputIDs.size(); testCase++) {
        string inputID = inputIDs[testCase];
        string inputPath = inputPaths[testCase];
        string outputPath = outputPaths[testCase];
        string userOutputPath = cachePath + directoryPathSeparator + inputID + ".userOut";

        // Run the case with provided runs script
        string run = runScriptBinaryPath + " " +
            cachePath + " " +
            binaryPath + " " +
            binaryName + " " +
            lang + " " +
            inputPath + " " +
            userOutputPath + " " +
            timeLimit;
        int runReturnCode = system(run.c_str());

        string verdict = "";

        // RTE or TLE
        if (runReturnCode != 0) {
            switch (runReturnCode) {
                case TLE:
                    verdict = "TLE";
                    break;
                case RTE:
                    verdict = "RTE";
                    break;
                default:
                    verdict = "INTERNAL_ERROR";
                    break;
            }
        }
        // All good! Let's check it now
        else {
            string check = "python3 -m apollo " +
                inputPath + " " +
                outputPath + " " +
                userOutputPath;
            int checkReturnCode = system(check.c_str());

            switch (checkReturnCode) {
                case AC:
                    verdict = "AC";
                    break;
                case WA:
                    verdict = "WA";
                    break;
                case PE:
                    verdict = "PE";
                    break;
                default:
                    verdict = "INTERNAL_ERROR";
                    break;
            }
        }

        cout << "{";
        cout << "\"inputId\":\"" + inputID + "\",";
        cout << "\"verdict\":\"" + verdict + "\"";
        cout << "}";
        cout.flush();
    }

    return 0;
}

