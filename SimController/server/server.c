 

/*
 *
 * re-adapted for simultra
 * 
 **/

#include<stdio.h>
#include<string.h>
#include<stdlib.h>
#include<sys/socket.h>
#include<arpa/inet.h>
#include<unistd.h>
#include<pthread.h>
#include<stdint.h>
#include <time.h>
#include "cJSON.h"

#include "payload.h"
#include "utils.h"
#include "config.h"
#include "atypes.h"

node_t* my_hosts; // dynamic list containing my nodes, to be populated using ADD.......
int my_hosts_number = -1;

// FIXME: dirty implementation; using global variables
int is_running = 0; // identifies if the simulation is running

//===================================================================================================
void* sending (void* destination_node)
{
    int t = 1, 	   // round
	len,
	sock = -1;
    struct sockaddr_in server;
    char server_reply[2000];
  
    srand((unsigned int)time(NULL));
    
    // create socket
    sock = socket(AF_INET , SOCK_STREAM , 0);
    if (sock == -1)
    {
	fprintf(stderr, "Error: cannot create socket\n");
    }
    
    debug("Socket created.");

    server.sin_addr.s_addr = inet_addr( ((node_t*) destination_node)->ip);
    server.sin_family = AF_INET;
    server.sin_port = htons( ((node_t*) destination_node)->port);

    // connect to remote node
    if (connect(sock , (struct sockaddr *)&server , sizeof(server)) < 0)
    {
	debug("%s is not available !", ((node_t*) destination_node)->name);
        //perror("connect failed");
    }

    debug("I am Connected.");
    
    // keep communicating with server
    
    while((len = recv(sock, server_reply, sizeof(server_reply), 0)) > 0)
    {
        debug("[%s] Server reply: %.*s\n", me, len, server_reply);
        debug("_________________________________________________________________________________________________________________________\n");

	// build the payload with random lat/lng
	payload_t payload = {0, 0};
	char* payload_string = NULL;
        set_payload(payload, &payload_string);

        debug("[%s] Sending location: %s\n", me, payload_string);
	sleep( ((node_t*) destination_node)->delay);

        // send some data
        if( send(sock , payload_string , strlen(payload_string) , 0) < 0)
        {
            debug("[%s] Send failed", me);
        }
	t++;
    }

    close(sock);

    return 0;
}

//===================================================================================================
// handling an incoming connection

void *new_connection_handler(void *socket_desc)
{
    //Get the socket descriptor
    int sock = (intptr_t) socket_desc;
    int read_size = 0;
    char client_message[2000];
    
    // to id the sender
    struct sockaddr_in sin;
    socklen_t len = sizeof(sin);
    char ip_str[INET_ADDRSTRLEN];
    
    // receiving a message from client
    while( (read_size = recv(sock , client_message , sizeof(client_message) , 0)) > 0 )
    {
        // identifying the sender
        if (getsockname(sock, (struct sockaddr *)&sin, &len) == -1)
            perror("getsockname");
        else
            inet_ntop(AF_INET, &(sin.sin_addr), ip_str, INET_ADDRSTRLEN);
	    
	// Parsing the JSON
        debug("Payload received from %s:%d", ip_str, ntohs(sin.sin_port));
	debug("Parsing the JSON content...");
	
	// extract the fields from json,
	printf("received: %s\n", client_message);
	payload_t payload = {0, 0};
	parse_payload(client_message, &payload);

        // build a new message, the response.
        char *Response = malloc(sizeof(char) * (strlen(payload.data) + sizeof(payload.command)+80)); // TODO !

	debug("Running command %d", payload.command);
	
	switch (payload.command)
	{

	    case START_SIMULATION:
	    {
		debug("START_SIMULATION Command received.");
		is_running = 1;
		// FIXME: implement this command
		sprintf(Response, "ok");
		break;
	    }
	    case CHECK_STATE:
	    {
	    debug("CHECK_STATE Command received.");
	    sprintf(Response, (is_running != 0) ? "1" : "0");
	    break;
	    }
	    case STOP_SIMULATION:
	    {
		debug("STOP_SIMULATION Command received.");
		is_running = 0;
		// FIXME: implement this command
		sprintf(Response, "ok");
		break;
	    }
	    default:
	    {
		debug("Unknown Command");
		sprintf(Response, "Your Command %d is unknown.", payload.command);
		break;
	    }
	}
	    // debug
	    printf("read_size = %d\n", read_size);
	    printf("writing --- %s\n", Response);
	    printf("strlen = %d\n", (int) strlen(Response));
	    
        // send back
        write(sock , Response , (int) strlen(Response));
        
        debug("___________________________________________________________________________________________________");
  
    }
     
    if(read_size == 0)
    {
	debug("Host <%s:%d> disconnected.", ip_str, ntohs(sin.sin_port));
        fflush(stdout);
    }
    else if(read_size == -1)
    {
        perror("recv failed");
    }

    return 0;
}

//===================================================================================================

void* receiving(void* port_p)
{  
    int port = *((int*) port_p);
    int socket_desc , client_sock;
    struct sockaddr_in server, client;
    socklen_t c = sizeof(client);

    //Create socket
    socket_desc = socket(AF_INET , SOCK_STREAM , 0);
    if (socket_desc == -1)
    {
        debug("Could not create socket !");
    }

    // prepare the sockaddr_in structure
    server.sin_family = AF_INET;
    server.sin_addr.s_addr = INADDR_ANY;
    server.sin_port = htons(port);
    bzero (&server.sin_zero, 8);


    if( bind(socket_desc,(struct sockaddr *)&server , sizeof(server)) < 0)
    {
        perror("bind failed !");
    }

    listen(socket_desc , MAX_NODES);

    // accept an incoming connection
    debug("Waiting for incoming connections on %d", port);

    c = sizeof(client);
    
    while( (client_sock = accept(socket_desc, (struct sockaddr *)&client, &c)) )
    {
        debug("Connection accepted");
        pthread_t thread_id;

        if( pthread_create( &thread_id, NULL, new_connection_handler, (void*) (intptr_t)client_sock) < 0)
        {
            perror("could not create thread");
        }
        int client_port = ntohs(client.sin_port);
        debug("Handler assigned for client: %s", ip_s(client));
    }

    if (client_sock < 0)
    {
        perror("accept failed");
    }

    return 0;
}

//==========================================================================================================

int main(int argc , char *argv[])
{
    int i,
        port = -1;  // listening port
        node_t* nodes = 0;

    char config_file[256];
    // set "config.json" by default
    sprintf(config_file, "config.json");
    
    // check for command line arguments
    if (argc == 2)
    {
        // set the argument as a config file
        sprintf(config_file, "%s", argv[1]);
    }

    // Load configuration from confX.json
    
    char * buffer = 0;
    load_config(config_file, &buffer);
    
    int n = set_nodes(&nodes, buffer, & port); // n: number of peers
    
    debug("##############################");
    debug("   Listener");
    debug("          port = %d", port);
    debug("##############################");
    

    pthread_t thread_listener;
    if( pthread_create( &thread_listener , NULL,  receiving, (void*) & port ) < 0)
    {
	fprintf(stderr,"Error : pthread_create() could not create thread.\n");
	return 1;
    }
    
    pthread_join( thread_listener, NULL);

#if 0
    debug("Thread assigned on %d.", port);
    
 
    debug("##############################");
    debug("   Emitter");
    debug("##############################");

    pthread_t* thread_emitter = malloc(n * sizeof(pthread_t));
    for ( i = 0 ; i < n ; i++  )
    {	
	if( pthread_create( &thread_emitter[i] , NULL ,  sending, (void*) (nodes+i) ) < 0)
	{
	    fprintf(stderr,"Error : pthread_create() could not create thread %d\n", i);
	    return 1;
	}
	debug("Thread assigned for %s", nodes[i].name);
    }

// TODO
//    for ( i = 0 ; i < n ; i++  )
//	  pthread_join( thread_emitter[i], NULL);    

#endif

    
}