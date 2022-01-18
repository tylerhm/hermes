#include <cstdlib>
#include <iostream>
#include <fstream>
#include <string>
#include <sstream>
#include <cstring>
#include <algorithm>
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

const int BUF_SIZE = 256;
char buf[BUF_SIZE];

// Convert string vector to JSON format
string stringVecToJSON(vector<string> &vec) {
    int len = vec.size();
    string ret = "";
    ret += '[';
    for (int i = 0; i < len; i++) {
        string str = vec[i];
        replace(str.begin(), str.end(), '\"', '\'');
        ret += "\"" + str + "\"";
        if (i < len - 1)
            ret += ',';
    }
    ret += ']';
    return ret;
}

const int NUM_ARGS = 11;
int main(int argc, char **argv) {
    if (argc - 1 < NUM_ARGS) {
        cout << "Usage: judge cachePath binaryName binaryPath lang input timeLimit directoryPathSeparator runScriptBinaryPath checker epsilon customCheckerPath\n";
        return 1;
    }

    // Parse arguments.
    string cachePath(argv[1]);
    string binaryName(argv[2]);
    string binaryPath(argv[3]);
    string lang(argv[4]);
    string input(argv[5]);
    string timeLimit(argv[6]);
    string directoryPathSeparator(argv[7]);
    string runScriptBinaryPath(argv[8]);
    string checker(argv[9]);
    string epsilon(argv[10]);
    string customCheckerPath(argv[11]);

    // Prep input and output location
    string inputPath = cachePath + directoryPathSeparator + binaryName + "-customInvocation.in";
    ofstream out(inputPath);
    out << input << "\n";
    out.close();
    string userOutputPath = cachePath + directoryPathSeparator + binaryName + "-customInvocation.user.out";

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

    string runStderr = "";
    if (fgets(buf, BUF_SIZE, runOutput) != NULL) {
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

    string verdict = "NONE";
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
    // Only check if a checker is provided
    else if (checker == "custom") {
        string apolloLaunch = "python3 -m apollo -v -c " + customCheckerPath;
        string check = apolloLaunch + " " +
            inputPath + " " +
            userOutputPath + " " +
            userOutputPath; // Custom invocation should not need a defined output... its custom

        FILE *checkOutput = popen(check.c_str(), "r");

        // Parse stdout from Apollo
        while (fgets(buf, 256, checkOutput) != NULL) {
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
                messages.push_back("Oops... This is unexpected o.0");
                break;
        }
    }

    // Make decision available to Hermes on stdout
    cout << "{";
    cout << "\"id\":\"" + binaryName + "\",";
    cout << "\"stdoutPath\":\"" + userOutputPath + "\",";
    cout << "\"verdict\":\"" + verdict + "\",";
    cout << "\"messages\":" + stringVecToJSON(messages);
    cout << "}";
    cout.flush();

    return 0;
}
