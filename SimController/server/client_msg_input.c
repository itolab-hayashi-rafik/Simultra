#include <stdio.h>
#include <string.h>
#include <sys/socket.h>
#include <arpa/inet.h>
#include <unistd.h>
#include <stdint.h>

#include <stdlib.h>
#include <time.h>

#include "geolocation.h"


int main(int argc , char *argv[])
{
    
    srand((unsigned int)time(NULL));

    geo();

    
    return 0;
    
    int port, len, sock = -1;    
    struct sockaddr_in server;
    char message[1000] , server_reply[2000];

    // checking commandline parameter
    if (argc != 3)
    {
		printf("Usage: %s hostname_ip port\n", argv[0]);
		return -1;
    }

    // obtain port number
    if (sscanf(argv[2], "%d", &port) <= 0)
    {
    	fprintf(stderr, "%s: error: wrong parameter: port\n", argv[0]);
    	return -2;
    }
        
    // create socket
    sock = socket(AF_INET , SOCK_STREAM , 0);
    if (sock == -1)
    {
	fprintf(stderr, "%s: error: cannot create socket\n", argv[0]);
    }
    
    puts("Socket created");

    server.sin_addr.s_addr = inet_addr(argv[1]);
    server.sin_family = AF_INET;
    server.sin_port = htons( port );

    // connect to remote server
    if (connect(sock , (struct sockaddr *)&server , sizeof(server)) < 0)
    {
        perror("connect failed !");
        return 1;
    }

    puts("Connected\n");

    // keep communicating with server
    while((len = recv(sock, server_reply, sizeof(server_reply), 0)) > 0)
    {
        printf("Server reply: %.*s\n", len, server_reply);
        printf("___________________________________________________\n");

        printf("Enter message : ");
        if (fgets(message, sizeof(message), stdin) == NULL)
            break;

        // send some data
        if( send(sock , message , strlen(message) , 0) < 0)
        {
            puts("Send failed");
            return 1;
        }
    }

    close(sock);

    return 0;
}