all: fastJudge fastCustomInvocation runguard

fastJudge:
	g++ ./src/main/runner/fastJudge.cpp -o ./src/binaries/fastJudge && \
  cp ./src/binaries/fastJudge ./release/app/binaries/
fastCustomInvocation:
	g++ ./src/main/runner/fastCustomInvocation.cpp -o ./src/binaries/fastCustomInvocation && \
  cp ./src/binaries/fastCustomInvocation ./release/app/binaries/
runguard:
	g++ ./src/main/runner/runguard.cpp -o ./src/binaries/runguard && \
  cp ./src/binaries/runguard ./release/app/binaries/

clean:
	rm ./src/main/runner/fastJudge ./src/main/runner/runguard
