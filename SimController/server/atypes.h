#ifndef ATYPES_H
#define ATYPES_H


typedef enum command
{
    INI = 0,
    START_SIMULATION,
    STOP_SIMULATION,
} command_t;


typedef struct node
{
    char *ip;
    int port;
    int delay;
    char *name;
} node_t;

#endif
