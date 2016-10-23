#ifndef UTILS_H
#define UTILS_H

#include "atypes.h"
#include "debug.h"

#define MAX_NODES 50
#define MAX_HOST_S_LENGTH 16

/*
 *
 * IP -> string
 * 
 */
const char* ip_s(struct sockaddr_in c)
{
    char* str = malloc(16);
    sprintf( str, "%u.%u.%u.%u\n",
	    (c.sin_addr.s_addr&0xFF),
	    ((c.sin_addr.s_addr&0xFF00)>>8),
	    ((c.sin_addr.s_addr&0xFF0000)>>16),
	    ((c.sin_addr.s_addr&0xFF000000)>>24));
    return str;
}


/*
 * Breaks string 'str' into a series of tokens using the delimiter 'delim'.
 * returns a list of length 'len' that contains the tokens.
 * Note: char*** list : to modify list, we need to pass a pointer to it.
 */
void splitolist(char* source, char*** list, int* len, const char* delim)
{
    char * p = NULL;
    
    char* src = malloc(sizeof(char) * (strlen(source)+1) ); // tmp
    strcpy(src, source),
    (*list) = malloc(MAX_NODES * sizeof(char*));
    for ( *len = 0, p = strtok (src, delim) ; p ; p = strtok (NULL, delim), (*len)++)
    {
	(*list)[*len] = malloc( sizeof(char) * (strlen(p) + 1));	
	strcpy((*list)[*len], p);
    }
    free(src);
}

/*
 * Removings all 'c's
 */
void remove_all_chars(char* str, char c)
{
    char *pr = str, *pw = str;
    while (*pr) {
        *pw = *pr++;
        pw += (*pw != c);
    }
    *pw = '\0';
}
/*
 *
 * populates node_t[] with 'hosts_number' hosts.
 *
 */

int get_hosts(char* hosts_names, node_t** hosts, int* hosts_number)
{
    char** hosts_list = NULL ;
    int i;

    splitolist( hosts_names, &hosts_list, hosts_number, ",");
    
    (*hosts) = malloc( (*hosts_number) * sizeof(node_t) );
    
    for ( i = 0 ; i < (*hosts_number) ; i++ )
    {
	char** host_list = NULL;
	int two, port;
	splitolist( hosts_list[i], &host_list, &two, ":");
	
	// populating the node_t cell
	(*hosts)[i].ip = malloc(sizeof(char) * (strlen(host_list[0])+1));
	strcpy((*hosts)[i].ip, host_list[0]);
	
	sscanf(host_list[1], "%d", &port);
	(*hosts)[i].port = port;

	//TODO remove_all_chars((*hosts)[i].ip, '"');
	    	
	 // TODO add names?
    }
    
    return 0;
}

#endif