CC=gcc
CFLAGS=-I.

all:	clean server

server: server.o
	@$(CC) -o server server.o cJSON.c payload.c -I. -lpthread -lm

clean:
	rm -f *.o *~ server

