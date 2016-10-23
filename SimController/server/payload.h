

#ifndef PAYLOAD_H
#define PAYLOAD_H

#include "atypes.h"

// Payload for SimController
typedef struct payload
{
    command_t command;
    char *data;
} payload_t;

// Start argument
typedef struct start_argument
{
    char *map;
    char *type;
    char *scenario;
} start_argument_t;
	
        
void parse_payload(char *text, payload_t* payload);
void set_payload(payload_t payload, char** result);

void parse_start_argument(char *text, start_argument_t* argument);

#endif
