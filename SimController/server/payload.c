#include <stdio.h>
#include <stdlib.h>
#include "cJSON.h"
#include<string.h>

#include "payload.h"
#include "debug.h"
	
/***************************************************************************************************************
 * input: payload as string
 * output: parse the payload string to JSON, then render back to text, and print.
 ************************************************************************************************/

void parse_payload(char *text, payload_t* payload)
{
	char* out;
        cJSON *json=cJSON_Parse(text);
	int i;
	
	if (!json)
	{
		printf("Error before: <%s>\n",cJSON_GetErrorPtr());
	}
	else
	{		
		cJSON *item = json;

		for ( i = 0 ; i < cJSON_GetArraySize(item) ; i++ )
		{
			cJSON* subitem = cJSON_GetArrayItem(item, i);
			if (!strcmp(subitem->string, "Command"))
			{
				out = cJSON_Print(subitem);
				sscanf(out, "%d", &payload->command);
			}
			else if (!strcmp(subitem->string, "Data"))
			{
				out = cJSON_Print(subitem);
				payload->data = malloc(strlen(out) + 1);
				sscanf(out, "%s", payload->data);
			}
				// TODO JSONDATA add here ...

		}

		free(out);
		cJSON_Delete(json);

	}
}

/*************************************************************************************************
 * input: payload structure
 * output: payload as string
 ************************************************************************************************/
void set_payload(payload_t payload, char** result)
{
	cJSON *root;
	char *out;
	
        root=cJSON_CreateObject();	        
        cJSON_AddNumberToObject(root, "Command", payload.command);
        cJSON_AddStringToObject(root, "Data", payload.data);
	
	// TODO JSONDATA add here ...
	
	out = cJSON_Print(root);
	cJSON_Delete(root);
	
	if ( (*result = malloc(sizeof(char) * (strlen(out) + 1))) != NULL )
        {
                strcpy(*result, out);
        }
        else
        {
                printf ("Cannot allocate *result !\n");
        }

	free(out);
}


/***************************************************************************************************************
 * input: payload as string
 * output: parse the payload string to JSON, then render back to text, and print.
 ************************************************************************************************/
 void parse_start_argument(char *text, start_argument_t* argument)
 {
    char* buf;
    cJSON *json=cJSON_Parse(text);

    printf("A\n");


    int i;
    if (!json)
    {
        printf("Error before: <%s>\n",cJSON_GetErrorPtr());
    }
    else
    {
        cJSON *item = json;

        for ( i = 0 ; i < cJSON_GetArraySize(item) ; i++ )
        {
            cJSON* subitem = cJSON_GetArrayItem(item, i);
            if (!strcmp(subitem->string, "map"))
            {
                printf("B\n");
                buf = cJSON_Print(subitem);
                argument->map = malloc(strlen(buf) + 1);
                sscanf(buf, "%s", argument->map);
            }
            else if (!strcmp(subitem->string, "type"))
            {
                printf("C\n");
                buf = cJSON_Print(subitem);
                argument->type = malloc(strlen(buf) + 1);
                sscanf(buf, "%s", argument->type);
            }
            else if (!strcmp(subitem->string, "scenario"))
            {
                printf("D\n");
                buf = cJSON_Print(subitem);
                argument->scenario = malloc(strlen(buf) + 1);
                sscanf(buf, "%s", argument->scenario);
            }
        }

    printf("E\n");
        printf("F\n");

        // free memory
        free(buf);
        cJSON_Delete(json);
    }
 }


/****************************************************
int main (int argc, const char * argv[])
{

        payload_t payload = {"precType", 1, 37.371, -1.220, "myCar"};
        
        char* mobility = NULL;

        set_payload(payload, &mobility);

	payload_t new_payload = {"", 1, 0., 0., ""};


        parse_payload(mobility, &new_payload);
	        
	return 0;
}
*********************************************/
