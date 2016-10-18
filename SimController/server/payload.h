

#ifndef PAYLOAD_H
#define PAYLOAD_H

#include "atypes.h"

// Payload for SimController
typedef struct payload
{
    command_t command;
    char *data;
} payload_t;
	
        
void parse_payload(char *text, payload_t* payload);
void set_payload(payload_t payload, char** result);

#endif
