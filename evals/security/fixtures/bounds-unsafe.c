#include <stddef.h>
#include <string.h>
int copy_input(char *dst, size_t capacity, const char *src, size_t length) {
    memcpy(dst, src, length);
    return 1;
}
