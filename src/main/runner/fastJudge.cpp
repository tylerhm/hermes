#include <cstdlib>
#include <iostream>
#include <string>
#include <cstring>
#include <vector>

using namespace std;

const string CPU_SOFT = "cpu";
const string CPU_HARD = "exited";
enum STATUS_CODES {
    // Apollo defined
    AC = 0,
    WA = 1,
    PE = 2,

    TLE = 3,
    RTE = 4,
};

// Parses comma separated list
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

// Convert string vector to JSON format
string stringVecToJSON(vector<string> &vec) {
    int len = vec.size();
    string ret = "";
    ret += '[';
    for (int i = 0; i < len; i++) {
        ret += "\"" + vec[i] + "\"";
        if (i < len - 1)
            ret += ',';
    }
    ret += ']';
    return ret;
}

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
        // Pipe stderr to stdout so that we can monitor for TLE or RTE
        // It would be nice to use return codes here, but unfortunately,
        // resource limitting is not guaranteed to provide an exit code. (OS dep)
        string run = runScriptBinaryPath + " " +
            cachePath + " " +
            binaryPath + " " +
            binaryName + " " +
            lang + " " +
            inputPath + " " +
            userOutputPath + " " +
            timeLimit + " 2>&1 >/dev/null";

        FILE *runOutput = popen(run.c_str(), "r");
        int runStatus = 0;

        char buf[100];
        string runStderr = "";
        if (fgets(buf, 100, runOutput) != NULL) {
            // Sanitize stderr, get rid of newlines and spaces
            string stdErrSanitized = "";
            for (int i = 0; buf[i] != '\0'; i++) {
                if (buf[i] != '\n' && buf[i] != '\b') {
                    if (buf[i] != ' ')
                      stdErrSanitized += tolower(buf[i]);
                    runStderr += buf[i];
                }
            }

            if (stdErrSanitized.find(CPU_SOFT) != string::npos || stdErrSanitized.find(CPU_HARD) != string::npos)
                runStatus = TLE;
            else runStatus = RTE;
        }

        // Close stream
        pclose(runOutput);

        string verdict = "";
        vector<string> messages;
        // RTE or TLE
        if (runStatus != 0) {
            switch (runStatus) {
                case TLE:
                    verdict = "TLE";
                    messages.push_back("TLE: Time Limit Exceeded");
                    messages.push_back("Execution timed out.");
                    break;
                case RTE:
                    verdict = "RTE";
                    messages.push_back("RTE: Run Time Error");
                    messages.push_back(runStderr);
                    break;
                default:
                    verdict = "INTERNAL_ERROR";
                    messages.push_back("Oops... This is unexpected o.0");
                    break;
            }
        }
        // All good! Let's check it now
        else {
            string check = "python3 -m apollo -v " +
                inputPath + " " +
                outputPath + " " +
                userOutputPath;

            FILE *checkOutput = popen(check.c_str(), "r");

            // Parse stdout from Apollo
            char buf[100];
            while (fgets(buf, 100, runOutput) != NULL) {
                string curMessage = "";
                for (int i = 0; buf[i] != '\0'; i++) {
                    if (buf[i] == '\n') {
                        if (curMessage != "")
                          messages.push_back(curMessage);
                        curMessage = "";
                    } else curMessage += buf[i];
                }
            }

            int checkStatus = pclose(checkOutput);
            int checkReturnCode = WEXITSTATUS(checkStatus);
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

        // Make our decision available to Hermes on stdout
        cout << "{";
        cout << "\"inputId\":\"" + inputID + "\",";
        cout << "\"verdict\":\"" + verdict + "\",";
        cout << "\"messages\":" + stringVecToJSON(messages);
        cout << "}";
        cout.flush();
    }

    return 0;
}

