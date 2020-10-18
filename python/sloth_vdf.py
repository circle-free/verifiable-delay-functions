import datetime
import time

p = 1000000007 # 32-bit prime
# p = 73237431696005972674723595250817150843 # 128-bit prime
# p = 60464814417085833675395020742168312237934553084050601624605007846337253615407 # 256-bit prime


def sqrt_mod_p_verify(y, x, p):
    if pow(y, 2) % p == x % p:
        return True
    
    return False


def is_quadratic_residue(x, p):
    return pow(x, (p - 1) >> 1, p) == 1


def mod_sqrt_op(x, e, p):
    # if not is_quadratic_residue(x, p):
    #     print(x, 'is not quad res')
    #     x = (-x) % p
    #     # x = p - x
    
    return pow(x, e, p)


def mod_op(x, t):
    x = x % p
    e = (p + 1) >> 2

    for _ in range(t):
        x = mod_sqrt_op(x, e, p)
    
    return x


def mod_verify(y, x, t):
    for _ in range(t):
        y = pow(int(y), 2, p)

    # if not is_quadratic_residue(y, p):
    #     print(y, 'is nor quad res')
    #     y = (-y) % p
    #     # y = p - y

    if x % p == y or (p - (x % p)) == y:
        return True

    return False


print('started')

x = 15407604648144170858455308405060162460500784633725363367539502074216831223793
t = 1000

start = time.time()
y = mod_op(x, t)
end = time.time()

print('Elapsed: ', format(end - start, '.3f'))

print('Beacon: ', y)

start = time.time()
print(mod_verify(y, x, t), '****')
end = time.time()

print('Verify Elapsed: ', format(end - start, '.3f'))


# 864,313g for 10,000-t verify
# 300,000-t vdf split into 30 pieces is managable
# 300,000-t vdf split into 300 pieces is more managable
