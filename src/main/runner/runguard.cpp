#include <iostream>
#include <string>
#include <sys/time.h>
#include <sys/resource.h>

using namespace std;

// Set resouce limit on this process
void setLimit(int type, int soft, int hard) {
    rlimit lim;
    lim.rlim_cur = soft;
    lim.rlim_max = hard;
    setrlimit(type, &lim);
}

const int NUM_ARGS = 7;
int main(int argc, char **argv) {
    if (argc - 1 < NUM_ARGS) {
        cerr << "Usage: runguard cachePath binaryPath binaryName lang inputPath outputPath timelimit(seconds)\n";
        return 1;
    }

    // Parse args.
    string cachePath(argv[1]);
    string binaryPath(argv[2]);
    string binName(argv[3]);
    string lang(argv[4]);
    string inputPath(argv[5]);
    string outputPath(argv[6]);
    int timeLimit = stoi(string(argv[7]));

    // Set the process limits.
    setLimit(RLIMIT_CPU, timeLimit, timeLimit + 1);

    string command = "";
    if (lang == "c" || lang == "cpp")
        command = binaryPath + " < " + inputPath + " > " + outputPath;
    else if (lang == "java")
        command = "java -cp " + cachePath + " " + binName + " < " + inputPath + " > " + outputPath;
    else if (lang == "py")
        command = "python3 " + binaryPath + " < " + inputPath + " > " + outputPath;

    if (command == "") {
        cerr << "Unrecognized language\n";
        return 1;
    }

    system(command.c_str());
    return 0;
}
